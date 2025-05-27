// src/components/charts/GradeDistributionChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { TeacherSubmissionViewDto } from '../../types/assignment';
import { AssignmentDetailsDto } from '../../types/assignment'; // For maxPoints

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GradeDistributionChartProps {
    submissions: TeacherSubmissionViewDto[];
    assignmentDetails: AssignmentDetailsDto;
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({ submissions, assignmentDetails }) => {
    const maxPoints = assignmentDetails.maxPoints ?? 100; // Default to 100 if not set

    // Define grade categories based on percentage of maxPoints
    // Adjust these ranges and labels as you see fit
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
                backgroundColor: '#3F72AF', // Palette: Medium Blue
                borderColor: '#112D4E',     // Palette: Darkest Blue
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const, // Makes it a horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                title: { display: true, text: 'Number of Students', color: '#112D4E'},
                ticks: { color: '#112D4E', stepSize: 1 }, // Ensure whole numbers
                grid: { color: '#DBE2EF' }
            },
            y: {
                ticks: { color: '#112D4E' },
                grid: { display: false }
            }
        },
        plugins: {
            legend: {
                display: false, // Usually not needed for single dataset bar chart
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