
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { TeacherSubmissionViewDto } from '../../types/assignment';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface SubmissionStatusPieChartProps {
    submissions: TeacherSubmissionViewDto[];
}

export const SubmissionStatusPieChart: React.FC<SubmissionStatusPieChartProps> = ({ submissions }) => {
    let notSubmittedCount = 0;
    let inProgressCount = 0;
    let submittedOnTimeCount = 0;
    let submittedLateCount = 0;
    
    

    submissions.forEach(s => {
        if (s.grade != null) return; 

        switch (s.status.toUpperCase()) { 
            case "NOT SUBMITTED":
                notSubmittedCount++;
                break;
            case "IN PROGRESS":
                inProgressCount++;
                break;
            case "SUBMITTED":
                submittedOnTimeCount++;
                break;
            case "SUBMITTED (LATE)": 
                submittedLateCount++;
                break;
            
        }
    });

    const data = {
        labels: ['Not Submitted', 'In Progress', 'Submitted (On Time)', 'Submitted (Late)'],
        datasets: [
            {
                data: [notSubmittedCount, inProgressCount, submittedOnTimeCount, submittedLateCount],
                backgroundColor: [
                    '#DBE2EF', 
                    '#FBBF24', 
                    '#3F72AF', 
                    '#EF4444', 
                ],
                borderColor: '#F9F7F7', 
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
                text: 'Current Submission Progress (Ungraded)',
                color: '#112D4E',
                font: { size: 16, weight: 'bold' as const }
            }
        },
    };

    const totalForThisChart = notSubmittedCount + inProgressCount + submittedOnTimeCount + submittedLateCount;
    if (totalForThisChart === 0 && submissions.every(s => s.grade != null)) {
         return (
            <div className="bg-white p-6 shadow-xl rounded-2xl text-[#112D4E] h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold mb-2">Submission Progress</h3>
                <p className="text-sm text-gray-500">All existing submissions are graded.</p>
            </div>
        );
    }
     if (totalForThisChart === 0) {
         return (
            <div className="bg-white p-6 shadow-xl rounded-2xl text-[#112D4E] h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold mb-2">Submission Progress</h3>
                <p className="text-sm text-gray-500">No ungraded submissions to display status for.</p>
            </div>
        );
    }


    return (
        <div className="bg-white p-4 md:p-6 shadow-xl rounded-2xl text-[#112D4E] h-[350px] md:h-[400px]">
            <Pie data={data} options={options} />
        </div>
    );
};