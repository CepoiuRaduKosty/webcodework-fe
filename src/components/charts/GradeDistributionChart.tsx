
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { TeacherSubmissionViewDto } from '../../types/assignment';
import { AssignmentDetailsDto } from '../../types/assignment'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GradeDistributionChartProps {
    submissions: TeacherSubmissionViewDto[];
    assignmentDetails: AssignmentDetailsDto;
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({ submissions, assignmentDetails }) => {
    const maxPoints = assignmentDetails.maxPoints ?? 100; 

    
    
    const gradeCategories = [
        { label: 'F (<60%)', min: 0, max: 59.99, count: 0 },
        { label: 'D (60-69%)', min: 60, max: 69.99, count: 0 },
        { label: 'C (70-79%)', min: 70, max: 79.99, count: 0 },
        { label: 'B (80-89%)', min: 80, max: 89.99, count: 0 },
        { label: 'A (90-100%)', min: 90, max: 100, count: 0 },
    ];

    submissions.forEach(s => {
        if (s.grade != null) {
            const percentage = (s.grade / maxPoints) * 100;
            for (const category of gradeCategories) {
                if (percentage >= category.min && percentage <= category.max) {
                    category.count++;
                    break;
                }
            }
        }
    });

    const data = {
        labels: gradeCategories.map(cat => cat.label),
        datasets: [
            {
                label: 'Number of Students',
                data: gradeCategories.map(cat => cat.count),
                backgroundColor: '#3F72AF', 
                borderColor: '#112D4E',     
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const, 
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                title: { display: true, text: 'Number of Students', color: '#112D4E'},
                ticks: { color: '#112D4E', stepSize: 1 }, 
                grid: { color: '#DBE2EF' }
            },
            y: {
                ticks: { color: '#112D4E' },
                grid: { display: false }
            }
        },
        plugins: {
            legend: {
                display: false, 
            },
            title: {
                display: true,
                text: 'Grade Distribution',
                color: '#112D4E',
                font: { size: 16, weight: 'bold' as const }
            },
        },
    };
    
    const gradedSubmissionsCount = submissions.filter(s => s.grade != null).length;
    if (gradedSubmissionsCount === 0) {
         return (
            <div className="bg-white p-6 shadow-xl rounded-2xl text-[#112D4E] h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold mb-2">Grade Distribution</h3>
                <p className="text-sm text-gray-500">No grades available yet to display distribution.</p>
            </div>
        );
    }


    return (
        <div className="bg-white p-4 md:p-6 shadow-xl rounded-2xl text-[#112D4E] h-[350px] md:h-[400px]">
            <Bar data={data} options={options} />
        </div>
    );
};