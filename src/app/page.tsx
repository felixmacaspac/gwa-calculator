"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

import {
  ExclamationTriangleIcon,
  PlusCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Grade {
  subject: string;
  grade: number | string;
  units: number | string;
}

export default function Home() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gwa, setGwa] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Check `localStorage` if there are any data saved. Otherwise save a default object to storage
  useEffect(() => {
    const storedGrades = localStorage.getItem("grades");
    if (storedGrades) {
      setGrades(JSON.parse(storedGrades));
      return;
    }
    const defaultGrades = [{
      subject: "Subject 1",
      grade: "0",
      units: "3",
    }];
    setGrades(defaultGrades)
    localStorage.setItem("grades", JSON.stringify(defaultGrades));
  }, [])

  // Check if `grades` is empty. Otherwise save current grades object to `localStorage`
  useEffect(() => {
    if (grades.length) {
      localStorage.setItem("grades", JSON.stringify(grades));
      return;
    }
  }, [grades]);

  const handleSubjectChange = (index: number, value: string) => {
    const updatedGrades = [...grades];
    updatedGrades[index] = { ...updatedGrades[index], subject: value };
    setGrades(updatedGrades);
  }
  
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
      setError("There should be atleast 1 subject");
      return;
    }
    const updatedGrades = [...grades];
    updatedGrades.splice(index, 1);
    updatedGrades.forEach((grade, index) => {
      if (/Subject [0-9]+/.test(grade.subject)) {
        grade.subject = `Subject ${index + 1}`
      }
    })
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

  const SubjectTableCell = ({grade, index}: {grade: Grade, index: number}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false)

    const SubjectInput = () => {
      const [newSubject, setNewSubject] = useState(grade.subject)

      return (
        <form
          onSubmit={e => {
            e.preventDefault();
            if (newSubject.length <= 0) return handleSubjectChange(index, `Subject ${index + 1}`)
            handleSubjectChange(index, newSubject)
          }}
        >
          <input
            className="px-1 py-2 w-full outline-gray-300 outline-1 outline text-center rounded-md focus-within:outline-blue-500 focus-within:outline-1 transition-colors duration-300"
            type="text"
            id="subject"
            name="subject"
            pattern="^[ A-Za-z0-9_?@.\/#&+\-]{0,12}$"
            maxLength={12}
            autoComplete="off"
            placeholder={`Subject ${index + 1}`}
            value={newSubject}
            autoFocus
            onChange={(e) =>
              setNewSubject(e.target.value)
            }
          />
        </form>
      )
    }

    return (
      <TableCell className="text-nowrap text-center font-medium text-xs lg:text-sm">
        {isEditing
          ? (<SubjectInput />)
          : (<span
              className="hover:cursor-pointer"
              onClick={(e) => setIsEditing(true)}
            >
              {grade.subject}
            </span>)
        }
      </TableCell>
    )
  }

  return (
    <>
      <main className="bg-main-blue overflow-hidden min-h-screen flex justify-center items-center flex-col">
        <h1 className="text-secondary text-2xl font-bold uppercase mb-4 lg:mb-10 text-white lg:text-6xl">
          GWA Calculator
        </h1>
        <div className="container px-4 max-w-[1200px]">
          <div className="w-full max-w-full lg:max-w-2xl mx-auto">
            {grades.length <= 1 && error && (
              <Alert variant="destructive" className="mb-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Cannot remove the last subject.
                </AlertDescription>
              </Alert>
            )}
            <button
              className="bg-white rounded-t-xl text-2xl ml-auto block px-4 py-2 font-bold border-gray-500 border-b"
              onClick={addSubject}
            >
              <PlusCircledIcon className="h-6 w-6" />
            </button>
            <Table className="table-fixed table">
              <TableHeader className="bg-main-yellow text-center align-middle sticky top-0">
                <TableRow className="w-full">
                  <TableHead className="text-main-blue font-bold text-center">
                    Subject
                  </TableHead>
                  <TableHead className="text-main-blue font-bold text-center">
                    Grade
                  </TableHead>
                  <TableHead className="text-main-blue font-bold text-center">
                    Units
                  </TableHead>
                  <TableHead className="text-main-blue font-bold mx-auto"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {grades.map((grade, index) => (
                  <TableRow key={index}>
                    <SubjectTableCell grade={grade} index={index}/>
                    <TableCell>
                      <input
                        className="px-1 py-2 w-full outline-gray-300 outline-1 outline text-center rounded-md focus-within:outline-blue-500 focus-within:outline-1 transition-colors duration-300"
                        type="text"
                        value={grade.grade}
                        onChange={(e) =>
                          handleGradeChange(index, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="px-1 py-2 w-full outline-gray-300 outline-1 outline text-center rounded-md focus-within:outline-blue-500 focus-within:outline-1 transition-colors duration-300"
                        type="text"
                        value={grade.units}
                        onChange={(e) =>
                          handleUnitsChange(index, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        className="bg-red-500 px-4 py-2 text-white font-medium rounded-md"
                        onClick={() => removeSubject(index)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <button
              className="bg-white rounded-xl mt-4 w-full text-main-blue font-bold uppercase px-2 py-4 block text-xl transition-colors duration-300  hover:bg-main-yellow disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-gray-300"
              onClick={calculateGwa}
            >
              Calculate
            </button>
            <p className="text-white font-bold uppercase text-xl lg:text-3xl mt-4">
              GWA: {gwa}
            </p>
          </div>
          <div className="mx-auto flex justify-center">
            <p className="text-white font-medium mt-14">
              Created with ❤️ by{" "}
              <a
                className="text-yellow-300 underline"
                href="https://felixmacaspac.dev/"
                target="_blank"
              >
                Felix Macaspac
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
