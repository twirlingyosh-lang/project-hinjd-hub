import { useState } from "react";
import { CrusherDiagnostics } from "@/data/crusher_logic";
import { DiagnosticNode } from "@/data/crusher_logic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Save, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSaveDiagnostic } from "@/hooks/useSaveDiagnostic";

const CrusherDiagnosticPage = () => {
  const [node, setNode] = useState<DiagnosticNode>(CrusherDiagnostics.root);
  const [history, setHistory] = useState<DiagnosticNode[]>([]);
  const navigate = useNavigate();
  const { save, saving, saved, resetSaved } = useSaveDiagnostic("crusher");

  const goTo = (key: string) => {
    setHistory((h) => [...h, node]);
    setNode(CrusherDiagnostics[key]);
  };

  const goBack = () => {
    if (history.length > 0) {
      setNode(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
    }
  };

  const reset = () => {
    setNode(CrusherDiagnostics.root);
    setHistory([]);
    resetSaved();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/troubleshooting")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">Crusher Decision Tree</h1>
        <Button variant="outline" size="sm" className="ml-auto" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-1" /> Restart
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">Step {history.length + 1}</p>

      {node.action ? (
        <Card className="border-2 border-primary/40 bg-primary/5">
          <CardContent className="p-6 md:p-10">
            <p className="text-xl md:text-3xl font-semibold leading-relaxed">{node.action}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              {history.length > 0 && (
                <Button variant="secondary" size="lg" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              <Button size="lg" onClick={reset}>
                <RotateCcw className="h-4 w-4 mr-1" /> Start Over
              </Button>
              <Button
                size="lg"
                variant={saved ? "secondary" : "default"}
                disabled={saving || saved}
                onClick={() => save(history, node)}
              >
                {saved ? (
                  <><Check className="h-4 w-4 mr-1" /> Saved</>
                ) : (
                  <><Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Result"}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          <Card>
            <CardContent className="p-6 md:p-10">
              <h2 className="text-2xl md:text-4xl font-bold">{node.question}</h2>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full py-8 md:py-12 text-2xl md:text-4xl rounded-2xl bg-green-600 hover:bg-green-700 text-white"
            onClick={() => node.yes_node && goTo(node.yes_node)}
          >
            YES
          </Button>
          <Button
            size="lg"
            className="w-full py-8 md:py-12 text-2xl md:text-4xl rounded-2xl bg-red-600 hover:bg-red-700 text-white"
            onClick={() => node.no_node && goTo(node.no_node)}
          >
            NO
          </Button>

          {history.length > 0 && (
            <Button variant="outline" size="lg" className="mt-2" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CrusherDiagnosticPage;
