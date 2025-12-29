import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  diagnosticId: string;
  existingAttachments?: string[];
  onUploadComplete?: (attachments: string[]) => void;
}

const DocumentUpload = ({ diagnosticId, existingAttachments = [], onUploadComplete }: DocumentUploadProps) => {
  const [attachments, setAttachments] = useState<string[]>(existingAttachments);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setIsUploading(true);
    const newAttachments: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive"
          });
          continue;
        }

        // Create unique file path: userId/diagnosticId/timestamp_filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${user.id}/${diagnosticId}/${timestamp}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
          continue;
        }

        newAttachments.push(filePath);
      }

      if (newAttachments.length > 0) {
        const allAttachments = [...attachments, ...newAttachments];
        
        // Update the diagnostic record
        const { error: updateError } = await supabase
          .from('belt_diagnostics')
          .update({ attachments: allAttachments })
          .eq('id', diagnosticId);

        if (updateError) throw updateError;

        setAttachments(allAttachments);
        onUploadComplete?.(allAttachments);
        
        toast({
          title: "Upload Complete",
          description: `${newAttachments.length} file(s) attached successfully`,
        });
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      toast({
        title: "Upload Error",
        description: "Failed to attach files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (filePath: string) => {
    try {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      const updatedAttachments = attachments.filter(a => a !== filePath);
      
      // Update the diagnostic record
      const { error: updateError } = await supabase
        .from('belt_diagnostics')
        .update({ attachments: updatedAttachments })
        .eq('id', diagnosticId);

      if (updateError) throw updateError;

      setAttachments(updatedAttachments);
      onUploadComplete?.(updatedAttachments);
      
      toast({
        title: "File Removed",
        description: "Attachment has been deleted",
      });
    } catch (err) {
      console.error('Error removing attachment:', err);
      toast({
        title: "Remove Failed",
        description: "Could not remove the file",
        variant: "destructive"
      });
    }
  };

  const getFileName = (path: string) => {
    const parts = path.split('/');
    const fullName = parts[parts.length - 1];
    // Remove timestamp prefix
    const nameWithoutTimestamp = fullName.replace(/^\d+_/, '');
    return nameWithoutTimestamp.length > 25 
      ? nameWithoutTimestamp.substring(0, 22) + '...' 
      : nameWithoutTimestamp;
  };

  const handleDownload = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFileName(filePath);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      toast({
        title: "Download Failed",
        description: "Could not download the file",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${diagnosticId}`}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="text-xs"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={14} className="mr-2" />
              Attach Documents
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          PDF, Word, Excel, Images (max 10MB)
        </span>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((filePath) => (
            <div
              key={filePath}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs group"
            >
              <FileText size={14} className="text-primary" />
              <button
                onClick={() => handleDownload(filePath)}
                className="hover:text-primary transition-colors"
              >
                {getFileName(filePath)}
              </button>
              <button
                onClick={() => handleRemoveAttachment(filePath)}
                className="opacity-50 hover:opacity-100 hover:text-destructive transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
