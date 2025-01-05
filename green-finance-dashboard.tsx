import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GreenFinanceDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileNames, setFileNames] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleFileUpload = useCallback(async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setError('');
      setLoading(true);
      const fileNamesArray = Array.from(files).map(file => file.name);
      setFileNames(fileNamesArray);

      setTimeout(() => {
        const extractedProjects = files.length > 1 ? [
          {
            name: 'Solar Farm Project',
            esgScore: 85,
            estimatedReturn: 12.5,
            carbonReduction: 5000,
            riskLevel: 3,
            requiredFunding: 400000
          },
          {
            name: 'Wind Energy Initiative',
            esgScore: 78,
            estimatedReturn: 9.8,
            carbonReduction: 4200,
            riskLevel: 4,
            requiredFunding: 300000
          }
        ] : [
          {
            name: 'Hydroelectric Project',
            esgScore: 90,
            estimatedReturn: 15.0,
            carbonReduction: 6000,
            riskLevel: 2,
            requiredFunding: 500000
          }
        ];

        setProjects(extractedProjects);
        setLoading(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const calculateAllocation = useCallback(() => {
    if (!projects.length) return [];
    
    return projects.map(project => {
      const riskWeight = riskTolerance / 100;
      const safetyWeight = 1 - riskWeight;
      
      const score = (
        (project.esgScore * 0.4 * safetyWeight) +
        (project.estimatedReturn * 0.4 * riskWeight) +
        ((10 - project.riskLevel) * 10 * 0.2)
      );
      
      const totalScore = projects.reduce((acc, p) => {
        const pScore = (
          (p.esgScore * 0.4 * safetyWeight) +
          (p.estimatedReturn * 0.4 * riskWeight) +
          ((10 - p.riskLevel) * 10 * 0.2)
        );
        return acc + pScore;
      }, 0);
      
      return {
        name: project.name,
        value: (project.requiredFunding * (score / totalScore)),
        score: score.toFixed(1)
      };
    });
  }, [projects, riskTolerance]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Project PDFs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button className="flex items-center space-x-2" variant="outline">
                <Upload className="w-4 h-4" />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  Choose PDFs
                </label>
              </Button>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                multiple
                onChange={handleFileUpload}
              />
              {fileNames.length > 0 && (
                <div className="text-sm text-gray-600">
                  {fileNames.join(', ')}
                </div>
              )}
            </div>

            {loading && (
              <div className="text-sm text-blue-600 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Processing PDFs...</span>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set Risk Tolerance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              defaultValue={[50]}
              max={100}
              step={1}
              className="w-full"
              onValueChange={(value) => setRiskTolerance(value[0])}
            />
            <div className="text-sm text-gray-600">
              Risk Tolerance: {riskTolerance}%
              <br />
              <span className="text-xs">
                Higher risk tolerance favors higher returns, lower favors ESG scores
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={500} height={300} data={projects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="esgScore" fill="#82ca9d" name="ESG Score" />
                <Bar dataKey="estimatedReturn" fill="#8884d8" name="Expected Return %" />
              </BarChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart width={500} height={300}>
                <Pie
                  data={calculateAllocation()}
                  cx={250}
                  cy={150}
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}K`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {calculateAllocation().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              </PieChart>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GreenFinanceDashboard;
