
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { TeacherSubmissionViewDto } from '../../types/assignment'; 

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface GradedSubmissionsPieChartProps {
    submissions: TeacherSubmissionViewDto[];
}

export const GradedSubmissionsPieChart: React.FC<GradedSubmissionsPieChartProps> = ({ submissions }) => {
    const submittedOrInProgress = submissions.filter(s => s.status !== "Not Submitted" && s.status !== "CompileError" && s.status !== "InternalError" && s.status !== "FileError");
    const gradedCount = submittedOrInProgress.filter(s => s.grade != null).length;
    const ungradedCount = submittedOrInProgress.length - gradedCount;

    const data = {
        labels: ['Graded', 'Submitted & Ungraded'],
        datasets: [
            {
                label: '# of Submissions',
                data: [gradedCount, ungradedCount],
                backgroundColor: [
                    '#3F72AF', 
                    '#DBE2EF', 
                ],
                borderColor: [
                    '#F9F7F7', 
                    '#F9F7F7',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#112D4E' } 
            },
            title: {
                display: true,
                text: 'Grading Status of Submissions',
                color: '#112D4E', 
                font: { size: 16, weight: 'bold' as const }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed;
                        }
                        const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) + '%' : '0%';
                        return `${context.label}: ${context.parsed} (${percentage})`;
                    }
                }
            }
        },
    };

    if (submittedOrInProgress.length === 0) {
        return (
            <div className="bg-white p-6 shadow-xl rounded-2xl text-[#112D4E] h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold mb-2">Grading Status</h3>
                <p className="text-sm text-gray-500">No submissions yet to display grading status.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 md:p-6 shadow-xl rounded-2xl text-[#112D4E] h-[350px] md:h-[400px]"> 
            <Pie data={data} options={options} />
        </div>
    );
};