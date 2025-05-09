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
import { motion, AnimatePresence } from "framer-motion";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import { useSearchParams, usePathname } from "next/navigation";

import {
  ExclamationTriangleIcon,
  PlusCircledIcon,
  TrashIcon,
  Share2Icon,
} from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharerName: string;
  setSharerName: (name: string) => void;
  linkCopied: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  sharerName,
  setSharerName,
  linkCopied,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-main-blue">Share your GWA calculation</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <Input
              id="name"
              value={sharerName}
              onChange={(e) => setSharerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
              required
            />
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-main-yellow text-main-blue font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors duration-300"
            >
              {linkCopied ? "Link Copied!" : "Copy Share Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface Grade {
  course: string;
  grade: number | string;
  units: number | string;
}

export default function Home() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gwa, setGwa] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [deansListText, setDeansListText] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [sharerName, setSharerName] = useState<string>("");
  const [shareLink, setShareLink] = useState<string>("");
  const [viewingSharedBy, setViewingSharedBy] = useState<string>("");

  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // First check if grades are in URL parameters
    const gradesParam = searchParams.get("grades");

    const sharedByParam = searchParams.get("sharedBy");
    
    if (sharedByParam) {
      try {
        const decodedName = decodeURIComponent(sharedByParam);
        setViewingSharedBy(decodedName);
      } catch (e) {
        console.error("Error parsing sharer name from URL", e);
      }
    }

    if (gradesParam) {
      try {
        const decodedGrades = JSON.parse(decodeURIComponent(gradesParam));
        if (Array.isArray(decodedGrades) && decodedGrades.length > 0) {
          setGrades(decodedGrades);
          // Calculate GWA automatically when loading from shared link
          const totalGradePoints = decodedGrades.reduce(
            (sum, grade) => sum + Number(grade.grade) * Number(grade.units),
            0
          );
          const totalUnits = decodedGrades.reduce(
            (sum, grade) => sum + Number(grade.units),
            0
          );
          const calculatedGwa = totalGradePoints / totalUnits;
          setGwa(Number(calculatedGwa.toFixed(2)));
          setDeansListText(getDeansList(calculatedGwa));
          return;
        }
      } catch (e) {
        console.error("Error parsing grades from URL", e);
      }
    }

    // If no URL parameters, check localStorage
    const storedGrades = localStorage.getItem("grades");
    if (storedGrades) {
      const parsedGrades = JSON.parse(storedGrades);
      // Check if the stored data uses the old "subject" key
      const migratedGrades = parsedGrades.map((grade: any) => ({
        course: grade.subject || grade.course,
        grade: grade.grade,
        units: grade.units,
      }));
      setGrades(migratedGrades);
    } else {
      const defaultGrades = [
        {
          course: "Course 1",
          grade: "0",
          units: "3",
        },
      ];
      setGrades(defaultGrades);
      localStorage.setItem("grades", JSON.stringify(defaultGrades));
    }
  }, [searchParams]);

  useEffect(() => {
    if (grades.length) {
      localStorage.setItem("grades", JSON.stringify(grades));
    }
  }, [grades]);

  const handleCourseChange = (index: number, value: string) => {
    const updatedGrades = [...grades];
    updatedGrades[index] = { ...updatedGrades[index], course: value };
    setGrades(updatedGrades);
  };

  const handleGradeChange = (index: number, value: number | string) => {
    const updatedGrades = [...grades];
    updatedGrades[index] = { ...updatedGrades[index], grade: value };
    setGrades(updatedGrades);
  };

  const handleUnitsChange = (index: number, value: number | string) => {
    const updatedGrades = [...grades];
    updatedGrades[index] = { ...updatedGrades[index], units: value };
    setGrades(updatedGrades);
  };

  const addCourse = () => {
    const newCourse: Grade = {
      course: `Course ${grades.length + 1}`,
      grade: "0",
      units: "3",
    };
    setGrades([...grades, newCourse]);
  };

  const removeCourse = (index: number) => {
    if (grades.length === 1) {
      setError("There should be at least 1 course");
      return;
    }
    const updatedGrades = [...grades];
    updatedGrades.splice(index, 1);
    updatedGrades.forEach((grade, index) => {
      if (/Course [0-9]+/.test(grade.course)) {
        grade.course = `Course ${index + 1}`;
      }
    });
    setGrades(updatedGrades);
  };

  const calculateGwa = () => {
    if (grades.length === 0) {
      setError("Please add at least one course");
      return;
    }

    let totalGradePoints = 0;
    let totalUnits = 0;
    let hasLowGrade = false;

    grades.forEach((grade) => {
      const gradeValue = Number(grade.grade);
      const unitsValue = Number(grade.units);

      totalGradePoints += gradeValue * unitsValue;
      totalUnits += unitsValue;

      if (gradeValue < 2.5) {
        hasLowGrade = true;
      }
    });

    const calculatedGwa = totalGradePoints / totalUnits;
    setGwa(Number(calculatedGwa.toFixed(2)));
    setError("");

    // Update URL with grades for sharing
    const params = new URLSearchParams();
    params.set("grades", encodeURIComponent(JSON.stringify(grades)));

    // Update browser URL without page reload
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    
    // Generate share link for modal
    setShareLink(window.location.origin + newUrl);

    if (calculatedGwa >= 3.25 && !hasLowGrade) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    setDeansListText(getDeansList(calculatedGwa));
  };

  const getDeansList = (gwa: number) => {
    const hasLowGrade = grades.some((grade) => Number(grade.grade) < 2.5);

    if (gwa >= 3.25) {
      if (hasLowGrade) {
        return "You did well, but you have a grade below 2.5, which disqualifies you from the Dean's List. Bawi next sem! :D";
      }
      if (gwa >= 3.5) {
        return "Congrats! You're on the Dean's First Honors List";
      }
      return "Congrats! You're on the Dean's Second Honors List";
    } else if (gwa < 3.25) {
      return "You need a GWA of at least 3.25 and no grades below 2.5 to qualify for the Dean's List, Bawi next sem! :D";
    }

    return "";
  };

  const CourseTableCell = ({
    grade,
    index,
  }: {
    grade: Grade;
    index: number;
  }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const CourseInput = () => {
      const [newCourse, setNewCourse] = useState(grade.course);

      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newCourse.length <= 0)
              return handleCourseChange(index, `Course ${index + 1}`);
            handleCourseChange(index, newCourse);
          }}
        >
          <input
            className="px-1 py-2 w-full outline-gray-300 outline-1 outline text-center rounded-md focus-within:outline-blue-500 focus-within:outline-1 transition-colors duration-300"
            type="text"
            id="course"
            name="course"
            pattern="^[ A-Za-z0-9_?@.\/#&+\-]{0,12}$"
            maxLength={12}
            autoComplete="off"
            placeholder={`Course ${index + 1}`}
            value={newCourse}
            autoFocus
            onChange={(e) => setNewCourse(e.target.value)}
          />
        </form>
      );
    };

    return (
      <TableCell className="text-nowrap text-center font-medium text-xs lg:text-sm">
        {isEditing ? (
          <CourseInput />
        ) : (
          <span
            className="hover:cursor-pointer text-sm lg:text-base"
            onClick={(e) => setIsEditing(true)}
          >
            {grade.course}
          </span>
        )}
      </TableCell>
    );
  };

  const handleShareButtonClick = () => {
    setSharerName("");
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sharerName.trim()) {
      return;
    }

    // Add sharer name to the URL
    const url = new URL(shareLink);
    url.searchParams.set("sharedBy", encodeURIComponent(sharerName));
    
    // Update the share link with the sharer's name
    setShareLink(url.toString());
    
    // Copy the link to clipboard
    navigator.clipboard.writeText(url.toString())
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };


  return (
    <main className="bg-main-blue overflow-hidden min-h-screen flex justify-center items-center flex-col">
      {showConfetti && <Fireworks autorun={{ speed: 3, duration: 5000 }} />}
      <div className="container px-4 lg:max-w-[1200px] place-items-baseline grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        <div>
          <h1 className="text-secondary text-3xl font-bold uppercasetext-white flex lg:text-4xl">
            NU GWA Calculator
          </h1>
          <div className="mt-4">
            <span className="block text-neutral-100 text-lg">
              About the creator:
            </span>
            <article className="text-neutral-200 mt-2">
              <p>
                Hi! 👋 {"I'm "}
                <a
                  className="underline font-semibold transition-colors duration-300 ease-in-out hover:text-main-yellow"
                  href="https://felixmacaspac.dev/"
                >
                  Felix Macaspac
                </a>
                , currently a 3rd year BSCS-ML student at NU Dasma. If{" "}
                {"you're"} interested in applications like this, I recently
                created one that can help NU students access and contribute to
                various learning resources. {"It's"} called {""}
                <a
                  className="group inline-flex items-center underline font-semibold transition-colors duration-300 ease-in-out hover:text-main-yellow"
                  href="https://enyunotes-fm.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  enyunotes
                  <svg
                    className="w-4 h-4 transition-colors duration-300 ease-in-out stroke-current group-hover:text-main-yellow text-white"
                    width="800px"
                    height="800px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="Interface / External_Link">
                      <path
                        id="Vector"
                        d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                </a>
              </p>
            </article>
          </div>
        </div>
        <div className="w-full col-span-2 max-w-full lg:max-w-2xl mx-auto blur-background">
          {grades.length <= 1 && error && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Cannot remove the last course.
              </AlertDescription>
            </Alert>
          )}
          <button
            className="bg-white rounded-t-xl text-2xl ml-auto block px-4 py-2 font-bold border-gray-500 border-b"
            onClick={addCourse}
          >
            <PlusCircledIcon className="h-6 w-6" />
          </button>
          <Table className="table-fixed table text-base">
            <TableHeader className="bg-main-yellow text-center align-middle sticky top-0">
              <TableRow className="w-full">
                <TableHead className="text-main-blue font-bold text-center">
                  Course
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
              <AnimatePresence>
                {grades.map((grade, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CourseTableCell grade={grade} index={index} />
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
                        onClick={() => removeCourse(index)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          <button
            className="bg-white rounded-xl mt-4 w-full text-main-blue font-bold uppercase px-2 py-4 block text-xl transition-colors duration-300 hover:bg-main-yellow disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-gray-300"
            onClick={calculateGwa}
          >
            Calculate
          </button>
          <AnimatePresence>
            {gwa > 0 && (
              <div className="relative bg-white/15 px-6 py-4 mt-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="text-white font-bold uppercase text-xl lg:text-3xl"
                  >
                    GWA: {gwa}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    onClick={handleShareButtonClick}
                    className="bg-main-yellow text-main-blue p-2 rounded-full hover:bg-yellow-400 transition-colors duration-300"
                    title="Share your calculation"
                  >
                    <Share2Icon className="h-5 w-5" />
                  </motion.button>
                </div>
                {deansListText && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="text-white font-medium italic text-sm lg:text-lg mt-2"
                  >
                    {deansListText}
                  </motion.p>
                )}
                {viewingSharedBy && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="text-white text-sm mt-3 font-medium"
                  >
                    Shared by: <span className="font-bold">{viewingSharedBy}</span>
                  </motion.p>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sharerName={sharerName}
        setSharerName={setSharerName}
        linkCopied={linkCopied}
        onSubmit={handleShareSubmit}
      />
    </main>
  );
}
