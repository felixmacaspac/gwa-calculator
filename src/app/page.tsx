"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ExclamationTriangleIcon,
  PlusCircledIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Grade {
  subject: string;
  grade: number | string;
  units: number | string;
}

export default function Home() {
  const [grades, setGrades] = useState<Grade[]>(() => {
    const storedGrades = localStorage.getItem("grades");
    if (storedGrades) {
      return JSON.parse(storedGrades);
    } else {
      return [
        {
          subject: "Subject 1",
          grade: "0",
          units: "3",
        },
      ];
    }
  });
  const [gwa, setGwa] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("grades", JSON.stringify(grades));
  }, [grades]);

  // Update grade value for a specific subject
  const handleGradeChange = (index: number, value: number | string) => {
    const updatedGrades = [...grades];
    updatedGrades[index] = { ...updatedGrades[index], grade: value };
    setGrades(updatedGrades);
  };

  // Update units value for a specific subject
  const handleUnitsChange = (index: number, value: number | string) => {
    const updatedGrades = [...grades];
    updatedGrades[index] = { ...updatedGrades[index], units: value };
    setGrades(updatedGrades);
  };

  // Add a new subject
  const addSubject = () => {
    const newSubject: Grade = {
      subject: `Subject ${grades.length + 1}`,
      grade: "0",
      units: "3",
    };
    setGrades([...grades, newSubject]);
  };

  // Remove a subject
  const removeSubject = (index: number) => {
    if (grades.length === 1) {
      setError("Cannot remove the last subject");
      return;
    }
    const updatedGrades = [...grades];
    updatedGrades.splice(index, 1);
    setGrades(updatedGrades);
  };

  // Calculate the GWA
  const calculateGwa = () => {
    if (grades.length === 0) {
      setError("Please add at least one subject");
      return;
    }

    let totalGradePoints = 0;
    let totalUnits = 0;

    grades.forEach((grade) => {
      totalGradePoints += Number(grade.grade) * Number(grade.units);
      totalUnits += Number(grade.units);
    });

    const calculatedGwa = totalGradePoints / totalUnits;
    setGwa(Number(calculatedGwa.toFixed(2))); // Limit to 2 decimal places
    setError("");
  };

  return (
    <main className="bg-main-blue overflow-hidden min-h-screen flex justify-center items-center flex-col">
      <h1 className="text-secondary text-6xl font-bold uppercase mb-10 text-white">
        GWA Calculator
      </h1>
      <div className="max-w-2xl mx-auto">
        {grades.length <= 1 && error && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Cannot remove the last subject.</AlertDescription>
          </Alert>
        )}
        <button
          className="bg-white rounded-t-xl text-2xl ml-auto block px-4 py-2 font-bold border-gray-500 border-b"
          onClick={addSubject}
        >
          <PlusCircledIcon className="h-6 w-6" />
        </button>
        <Table>
          <TableHeader className="bg-main-yellow">
            <TableRow>
              <TableHead className="text-main-blue font-bold">
                Subject
              </TableHead>
              <TableHead className="text-main-blue font-bold">Grade</TableHead>
              <TableHead className="text-main-blue font-bold">Units</TableHead>
              <TableHead className="text-main-blue font-bold"></TableHead>{" "}
              {/* Empty TableHead for Actions */}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {grades.map((grade, index) => (
              <TableRow key={index}>
                <TableCell>{grade.subject}</TableCell>
                <TableCell>
                  <input
                    className="px-1 py-2"
                    type="text"
                    value={grade.grade}
                    onChange={(e) => handleGradeChange(index, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <input
                    className="px-1 py-2"
                    type="text"
                    value={grade.units}
                    onChange={(e) => handleUnitsChange(index, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <button onClick={() => removeSubject(index)}>
                    <MinusCircledIcon className="h-6 w-6" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <button
          className="bg-white rounded-xl mt-4 w-full text-main-blue font-bold uppercase px-2 py-4 block text-xl"
          onClick={calculateGwa}
        >
          Calculate
        </button>
        <p className="text-white font-bold uppercase text-3xl mt-4">
          GWA: {gwa}
        </p>
      </div>
    </main>
  );
}
