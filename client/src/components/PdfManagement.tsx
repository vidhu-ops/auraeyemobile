import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Download, Clock, Palette, Calculator, Calendar } from "lucide-react";

interface UserPdf {
  id: number;
  userId: number;
  fileName: string;
  filePath: string;
  analysisType: string;
  analysisId: number;
  analysisName: string;
  createdAt: string;
}

export function PdfManagement() {
  const { user } = useAuth();

  const { data: pdfs = [], isLoading, refetch } = useQuery<UserPdf[]>({
    queryKey: ['/api/pdfs'],
    enabled: !!user,
  });

  const downloadPdf = async (pdf: UserPdf) => {
    try {
      const response = await fetch(`/api/pdfs/${pdf.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = pdf.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'aura_reading':
        return <Palette className="h-4 w-4 text-purple-500" />;
      case 'numerology':
        return <Calculator className="h-4 w-4 text-blue-500" />;
      case 'object_analysis':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAnalysisTypeName = (type: string) => {
    switch (type) {
      case 'aura_reading':
        return 'Aura Reading';
      case 'numerology':
        return 'Numerology';
      case 'object_analysis':
        return 'Object Analysis';
      default:
        return 'Analysis';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'aura_reading':
        return 'bg-purple-100 text-purple-800';
      case 'numerology':
        return 'bg-blue-100 text-blue-800';
      case 'object_analysis':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group PDFs by date
  const groupedPdfs = pdfs.reduce((groups, pdf) => {
    const date = format(new Date(pdf.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(pdf);
    return groups;
  }, {} as Record<string, UserPdf[]>);

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedPdfs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          My Downloaded PDFs ({pdfs.length})
        </CardTitle>
        <CardDescription>
          Re-download your analysis reports anytime
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No PDFs saved yet</p>
            <p className="text-sm text-gray-500">
              Download analysis reports to save them here for easy access
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">
                    {format(new Date(date), 'MMMM dd, yyyy')}
                  </h3>
                  <Badge variant="outline" className="ml-auto">
                    {groupedPdfs[date].length} file{groupedPdfs[date].length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="grid gap-3">
                  {groupedPdfs[date].map((pdf) => (
                    <div key={pdf.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getAnalysisTypeIcon(pdf.analysisType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{pdf.analysisName}</h4>
                            <Badge variant="outline" className={getTypeColor(pdf.analysisType)}>
                              {getAnalysisTypeName(pdf.analysisType)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(pdf.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => downloadPdf(pdf)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}