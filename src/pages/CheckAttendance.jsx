import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { ref, get, set, update, remove } from "firebase/database";
import { toast } from "react-toastify";
import AIChatBot from "../components/AIChatBot";
import { motion } from "framer-motion";

function CheckAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceCriteria, setAttendanceCriteria] = useState(75);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentDay, setCurrentDay] = useState("");
  const [startDate, setStartDate] = useState(""); // New state for start date
  const [holidays, setHolidays] = useState({}); 
  const [newClass, setNewClass] = useState({
    subject: "",
    startTime: "",
    endTime: "",
  });
  const [markedToday, setMarkedToday] = useState({});
  const [newSubject, setNewSubject] = useState("");
  const [viewMode, setViewMode] = useState("today");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Utility functions
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const parsedHours = parseInt(hours, 10);
    const ampm = parsedHours >= 12 ? "PM" : "AM";
    const formattedHours = parsedHours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const start = new Date(0, 0, 0, startHour, startMin);
    const end = new Date(0, 0, 0, endHour, endMin);
    const diff = (end - start) / (1000 * 60 * 60);
    return diff > 0 ? diff : 24 + diff;
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const subjectsRef = ref(db, `subjects/${user.uid}`);
        const scheduleRef = ref(db, `schedules/${user.uid}`);
        const attendanceRef = ref(db, `attendance/${user.uid}`);
        const holidaysRef = ref(db, `holidays/${user.uid}`);
        const [subjectsSnapshot, scheduleSnapshot, attendanceSnapshot, holidaysSnapshot] =
        await Promise.all([
          get(subjectsRef),
          get(scheduleRef),
          get(attendanceRef),
          get(holidaysRef),
        ]);

      setSubjects(subjectsSnapshot.exists() ? subjectsSnapshot.val() : []);
      setSchedule(scheduleSnapshot.exists() ? scheduleSnapshot.val() : {});
      setAttendance(attendanceSnapshot.exists() ? attendanceSnapshot.val() : {});
      setHolidays(holidaysSnapshot.exists() ? holidaysSnapshot.val() : {}); // Set holidays

      // Set start date if exists
      if (scheduleSnapshot.exists() && scheduleSnapshot.val().startDate) {
        setStartDate(scheduleSnapshot.val().startDate);
      }

      if (scheduleSnapshot.exists() && scheduleSnapshot.val().attendanceCriteria) {
        setAttendanceCriteria(scheduleSnapshot.val().attendanceCriteria);
      }

      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      const markedStatus = {};
      if (attendanceSnapshot.exists()) {
        Object.keys(attendanceSnapshot.val()).forEach((subject) => {
          markedStatus[subject] = attendanceSnapshot.val()[subject].markedToday || {};
        });
      }
      setMarkedToday(markedStatus);

      setLoading(false);
    }
  };

    fetchData();
  }, []);

  const handleAddSubject = async () => {
    if (newSubject.trim() === "") return;

    // Check if the subject already exists (case-insensitive)
    if (
      subjects.some(
        (subject) => subject.toLowerCase() === newSubject.trim().toLowerCase()
      )
    ) {
      toast.error("This subject already exists!");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const updatedSubjects = [...subjects, newSubject.trim()];
      const subjectsRef = ref(db, `subjects/${user.uid}`);
      await set(subjectsRef, updatedSubjects);
      setSubjects(updatedSubjects);
      setNewSubject("");
      toast.success("Subject added successfully");
    }
  };

  const handleRemoveSubject = async (subjectToRemove) => {
    const user = auth.currentUser;
    if (user) {
      // Show confirmation dialog
      const isConfirmed = window.confirm(
        `Are you sure you want to delete the subject "${subjectToRemove}"? This will permanently remove all attendance data for this subject.`
      );

      if (isConfirmed) {
        try {
          // Remove subject from subjects list
          const updatedSubjects = subjects.filter(
            (subject) => subject !== subjectToRemove
          );
          const subjectsRef = ref(db, `subjects/${user.uid}`);
          await set(subjectsRef, updatedSubjects);

          // Remove attendance data for the subject
          const attendanceRef = ref(
            db,
            `attendance/${user.uid}/${subjectToRemove}`
          );
          await remove(attendanceRef);

          // Remove subject from schedule
          const scheduleRef = ref(db, `schedules/${user.uid}`);
          const scheduleSnapshot = await get(scheduleRef);
          if (scheduleSnapshot.exists()) {
            const currentSchedule = scheduleSnapshot.val();
            Object.keys(currentSchedule).forEach((day) => {
              if (Array.isArray(currentSchedule[day])) {
                currentSchedule[day] = currentSchedule[day].filter(
                  (cls) => cls.subject !== subjectToRemove
                );
              }
            });
            await set(scheduleRef, currentSchedule);
          }

          // Update local state
          setSubjects(updatedSubjects);
          setAttendance((prev) => {
            const newAttendance = { ...prev };
            delete newAttendance[subjectToRemove];
            return newAttendance;
          });
          setSchedule((prev) => {
            const newSchedule = { ...prev };
            Object.keys(newSchedule).forEach((day) => {
              if (Array.isArray(newSchedule[day])) {
                newSchedule[day] = newSchedule[day].filter(
                  (cls) => cls.subject !== subjectToRemove
                );
              }
            });
            return newSchedule;
          });

          toast.success("Subject and its attendance data removed successfully");
        } catch (error) {
          console.error("Error removing subject:", error);
          toast.error("Error removing subject. Please try again.");
        }
      }
    }
  };

  const handleMarkHoliday = async (date) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const holidaysRef = ref(db, `holidays/${user.uid}`);
        const updatedHolidays = { ...holidays, [date]: true };
        await set(holidaysRef, updatedHolidays);
        setHolidays(updatedHolidays);
        toast.success("Day marked as holiday successfully");
      } catch (error) {
        toast.error("Error marking holiday");
        console.error("Error marking holiday:", error);
      }
    }
  };

  const handleSetSchedule = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        const scheduleRef = ref(db, `schedules/${user.uid}`);
        const updatedSchedule = { ...schedule };

        // Check for time slot conflicts
        const isConflict = updatedSchedule[currentDay]?.some((cls) => {
          return (
            newClass.startTime < cls.endTime && newClass.endTime > cls.startTime
          );
        });

        if (isConflict) {
          toast.error("Class time conflicts with an existing class.");
          return;
        }

        // Update the schedule with the new class
        updatedSchedule[currentDay] = [
          ...(updatedSchedule[currentDay] || []),
          newClass,
        ];
        await set(scheduleRef, { 
          ...updatedSchedule, 
          attendanceCriteria,
          startDate });
        setSchedule(updatedSchedule);
        toast.success("Schedule updated successfully");
        setEditMode(false);
        setNewClass({ subject: "", startTime: "", endTime: "" });
      } catch (error) {
        toast.error("Error saving schedule");
        console.error("Error saving schedule:", error);
      }
    }
  };

  const handleDeleteClass = async (day, index) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const updatedSchedule = { ...schedule };
        updatedSchedule[day].splice(index, 1);
        if (updatedSchedule[day].length === 0) {
          delete updatedSchedule[day];
        }
        const scheduleRef = ref(db, `schedules/${user.uid}`);
        await set(scheduleRef, updatedSchedule);
        setSchedule(updatedSchedule);
        toast.success("Class deleted successfully");
      } catch (error) {
        toast.error("Error deleting class");
        console.error("Error deleting class:", error);
      }
    }
  };

  const handleMarkAttendance = async (
    subject,
    day,
    startTime,
    endTime,
    isPresent
  ) => {
    const user = auth.currentUser;
    const hours = calculateDuration(startTime, endTime);

    if (user) {
      const updatedAttendance = { ...attendance };
      if (!updatedAttendance[subject]) {
        updatedAttendance[subject] = { present: 0, total: 0, markedToday: {} };
      }

      const sessionKey = `${subject}-${day}-${startTime}-${endTime}`;

      if (!updatedAttendance[subject].markedToday[sessionKey]) {
        updatedAttendance[subject].total += hours;
        if (isPresent) {
          updatedAttendance[subject].present += hours;
        }
        updatedAttendance[subject].markedToday[sessionKey] = isPresent;
        setMarkedToday((prev) => ({
          ...prev,
          [subject]: { ...prev[subject], [sessionKey]: isPresent },
        }));

        try {
          const attendanceRef = ref(db, `attendance/${user.uid}`);
          await update(attendanceRef, updatedAttendance);
          setAttendance(updatedAttendance);
          toast.success(
            `Marked ${isPresent ? "present" : "absent"} for ${subject}`
          );
        } catch (error) {
          toast.error("Error updating attendance");
          console.error("Error updating attendance:", error);
        }
      } else {
        toast.info(
          `Attendance for this session of ${subject} has already been marked.`
        );
      }
    }
  };

  const calculateAttendancePercentage = (subject) => {
    if (attendance[subject]) {
      return (
        (attendance[subject].present / attendance[subject].total) *
        100
      ).toFixed(2);
    }
    return "0.00";
  };

  const renderSubjectForm = () => (
    <motion.div
      className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-8"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-4">Manage Subjects</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter new subject"
          className="flex-grow px-4 py-2 rounded-lg bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-100 placeholder-white/60 dark:placeholder-gray-400 border border-white/20 dark:border-gray-600"
        />
        <motion.button
          onClick={handleAddSubject}
          className="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 dark:hover:bg-green-700"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Add Subject
        </motion.button>
      </div>
      <motion.ul className="space-y-2">
        {subjects.map((subject, index) => (
          <motion.li
            key={index}
            className="flex justify-between items-center p-3 bg-white/5 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg text-white dark:text-gray-100"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <span>{subject}</span>
            <motion.button
              onClick={() => handleRemoveSubject(subject)}
              className="bg-red-500 dark:bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-600 dark:hover:bg-red-700"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Remove
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
  const calculateAttendanceStatus = () => {
    const newStatus = {};
    subjects.forEach((subject) => {
      if (attendance[subject]) {
        const { present, total } = attendance[subject];
        const currentPercentage = (present / total) * 100;
        const requiredClasses = Math.ceil((0.75 * total - present) / 0.75);
        const possibleBunks = Math.floor(present - 0.75 * total);

        if (currentPercentage < 75) {
          newStatus[subject] = `Attend ${requiredClasses} more class${
            requiredClasses > 1 ? "es" : ""
          } to reach 75%`;
        } else if (possibleBunks > 0) {
          newStatus[subject] = `You can bunk ${possibleBunks} class${
            possibleBunks > 1 ? "es" : ""
          } and still maintain 75%`;
        } else {
          newStatus[subject] =
            "Attend more classes to have the option to bunk later";
        }
      } else {
        newStatus[subject] = "No attendance data available";
      }
    });
    setAttendanceStatus(newStatus);
  };

  useEffect(() => {
    calculateAttendanceStatus();
  }, [attendance, subjects]);

  const renderScheduleForm = () => (
    <motion.div
      className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-8"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-4">Edit Schedule</h2>
      
      {/* Start Date Field */}
      <div className="mb-4">
        <label className="block text-white dark:text-gray-100 mb-2">Schedule Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white dark:text-gray-100 mb-2">Attendance Criteria (%)</label>
        <input
          type="number"
          value={attendanceCriteria}
          onChange={(e) => setAttendanceCriteria(Number(e.target.value))}
          className="w-full px-4 py-2 rounded-lg bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-100"
          min="0"
          max="100"
        />
      </div>
      <form onSubmit={handleSetSchedule} className="space-y-4">
        {/* Day field */}
        <div className="space-y-2">
          <label className="block text-white dark:text-gray-100">Day</label>
          <select
            value={currentDay}
            onChange={(e) => setCurrentDay(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-100"
          >
            <option value="">Select a day</option>
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Subject field */}
        <div className="space-y-2">
          <label className="block text-white dark:text-gray-100">Subject</label>
          <select
            value={newClass.subject}
            onChange={(e) =>
              setNewClass({ ...newClass, subject: e.target.value })
            }
            required
            className="w-full px-4 py-2 rounded-lg bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-100"
          >
            <option value="">Select a subject</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Start Time field */}
        <div className="space-y-2">
          <label className="block text-white dark:text-gray-100">Start Time</label>
          <input
            type="time"
            value={newClass.startTime}
            onChange={(e) =>
              setNewClass({ ...newClass, startTime: e.target.value })
            }
            required
            className="w-full px-4 py-2 rounded-lg bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-100"
          />
        </div>

        {/* End Time field */}
        <div className="space-y-2">
          <label className="block text-white dark:text-gray-100">End Time</label>
          <input
            type="time"
            value={newClass.endTime}
            onChange={(e) =>
              setNewClass({ ...newClass, endTime: e.target.value })
            }
            required
            className="w-full px-4 py-2 rounded-lg bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm text-white dark:text-gray-100"
          />
        </div>

        <motion.button
          type="submit"
          className="w-full bg-indigo-500 dark:bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-700"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Add Class
        </motion.button>
      </form>
    </motion.div>
  );

  const renderSchedule = () => (
    <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-4">Current Schedule</h2>
      <p className="text-white dark:text-gray-100 mb-4">Attendance Criteria: {attendanceCriteria}%</p>
      {Object.entries(schedule)
        .filter(([day, classes]) => day !== "attendanceCriteria")
        .map(([day, classes]) => (
          <div key={day} className="bg-white/5 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-4 mb-4">
            <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-3">{day}</h3>
            {Array.isArray(classes) && classes.length > 0 ? (
              classes.map((cls, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white/20 dark:bg-gray-600/50 backdrop-blur-sm rounded-lg p-4 mb-2"
                >
                  <span className="text-white dark:text-gray-100">
                    {cls.subject}: {formatTime(cls.startTime)} -{" "}
                    {formatTime(cls.endTime)}
                  </span>
                  <button
                    onClick={() => handleDeleteClass(day, index)}
                    className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-white/60 dark:text-gray-400 italic">No classes scheduled for this day.</p>
            )}
          </div>
        ))}
    </div>
  );

  const renderTodaySchedule = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayDate = new Date().toISOString().split('T')[0];
    const isHoliday = holidays[todayDate];

    // Check if today's date is before start date
    const isBeforeStartDate = startDate && new Date(todayDate) < new Date(startDate);

    return (
      <motion.div
        className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-8"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white dark:text-gray-100">
            Today's Schedule ({today})
          </h3>
          {!isHoliday && !isBeforeStartDate && (
            <motion.button
              onClick={() => handleMarkHoliday(todayDate)}
              className="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Mark as Holiday
            </motion.button>
          )}
        </div>

        {isBeforeStartDate ? (
          <p className="text-white dark:text-gray-100">Schedule hasn't started yet. Start date: {startDate}</p>
        ) : isHoliday ? (
          <p className="text-white dark:text-gray-100">Today is marked as a holiday.</p>
        ) : schedule[today] ? (
          <div className="space-y-4">
            {schedule[today].map((cls, index) => {
              const sessionKey = `${cls.subject}-${today}-${cls.startTime}-${cls.endTime}`;
              const isMarked = markedToday[cls.subject]?.[sessionKey];
              return (
                <motion.div
                  key={index}
                  className="bg-white/5 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-4 text-white dark:text-gray-100"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {cls.subject}: {formatTime(cls.startTime)} -{" "}
                      {formatTime(cls.endTime)}
                    </span>
                    {isMarked === undefined ? (
                      <div className="space-x-2">
                        <motion.button
                          onClick={() =>
                            handleMarkAttendance(
                              cls.subject,
                              today,
                              cls.startTime,
                              cls.endTime,
                              true
                            )
                          }
                          className="bg-green-500 dark:bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-600 dark:hover:bg-green-700"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Present
                        </motion.button>
                        <motion.button
                          onClick={() =>
                            handleMarkAttendance(
                              cls.subject,
                              today,
                              cls.startTime,
                              cls.endTime,
                              false
                            )
                          }
                          className="bg-red-500 dark:bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-600 dark:hover:bg-red-700"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Absent
                        </motion.button>
                      </div>
                    ) : (
                      <span
                        className={`px-4 py-1 rounded-lg ${
                          isMarked ? "bg-green-500 dark:bg-green-600" : "bg-red-500 dark:bg-red-600"
                        }`}
                      >
                        Marked {isMarked ? "Present" : "Absent"}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-white dark:text-gray-100">No classes scheduled for today.</p>
        )}
      </motion.div>
    );
  };

  const renderAttendanceSummary = () => (
    <motion.div
      className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-8"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-2xl font-bold text-white dark:text-gray-100 mb-4">Attendance Summary</h3>
      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <motion.div
            key={index}
            className="bg-white/5 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-4"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <p className="text-white dark:text-gray-100 text-lg font-semibold">
              {subject}: {calculateAttendancePercentage(subject)}%
            </p>
            <p className="text-white/80 dark:text-gray-300 text-sm mt-1">
              {attendanceStatus[subject]}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 py-8">
      <motion.div
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl font-bold mb-8 mt-10 text-center text-white dark:text-gray-100 font-ahkio">
          Check Attendance
        </h1>
        {loading ? (
          <p className="text-white dark:text-gray-100 text-center">Loading...</p>
        ) : (
          <>
            <div className="flex justify-center space-x-4 mb-8">
              {["today", "edit", "summary"].map((mode) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === mode
                      ? "bg-white dark:bg-gray-200 text-purple-600 dark:text-purple-800"
                      : "bg-white/20 dark:bg-gray-700/50 text-white dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-600/50"
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </motion.button>
              ))}
            </div>
            {viewMode === "today" && renderTodaySchedule()}
            {viewMode === "edit" && (
              <>
                {renderSubjectForm()}
                {renderScheduleForm()}
                {renderSchedule()}
              </>
            )}
            {viewMode === "summary" && renderAttendanceSummary()}
            <AIChatBot />
          </>
        )}
      </motion.div>
    </div>
  );
}

export default CheckAttendance;