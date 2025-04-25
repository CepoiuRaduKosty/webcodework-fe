import { ClassroomDetailsDto } from "../types/classroom"

export const ClassroomTopElement: React.FC<{ classroomDetails: ClassroomDetailsDto }> = ({ classroomDetails }) => {
    return <>
        <div className="bg-white p-4 md:p-6 shadow rounded-lg mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{classroomDetails.name}</h1>
        {classroomDetails.description && <p className="mt-1 text-gray-600">{classroomDetails.description}</p>}
        <p className="mt-2 text-sm text-gray-500">Your role: <span className="font-semibold">{classroomDetails.currentUserRole}</span></p>
      </div>
    </>
}