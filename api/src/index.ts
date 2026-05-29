import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// ==========================================
// مسار الفحص
// ==========================================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running!" });
});

// ==========================================
// مسارات الطلاب
// ==========================================
app.get("/students", async (req, res) => {
  try {
    const students = await prisma.student.findMany({ include: { user: true } });
    res.status(200).json(students);
  } catch (error) {
    console.error("GET_STUDENTS_ERROR:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { nameAr, nameEn, email, nationality, status } = req.body;
    const newStudent = await prisma.student.create({
      data: {
        nameAr, nameEn, status: status || 'LEAD', nationality,
        user: { create: { email: email || `user-${Date.now()}@academy.com`, role: 'STUDENT', isActive: true } }
      },
      include: { user: true }
    });
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("PRISMA_ERROR:", error); 
    res.status(500).json({ error: "Failed to create student" });
  }
});

// ==========================================
// مسارات المعلمين
// ==========================================
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({ include: { user: true } });
    res.status(200).json(teachers);
  } catch (error) {
    console.error("GET_TEACHERS_ERROR:", error);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

app.post("/teachers", async (req, res) => {
  try {
    const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;
    const newTeacher = await prisma.teacher.create({
      data: {
        nameAr, nameEn, specialization, status: status || 'ACTIVE',
        paymentMethod: paymentMethod || 'HOURLY',
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        percentageRate: percentageRate ? parseFloat(percentageRate) : null,
        user: { create: { email: email || `teacher-${Date.now()}@academy.com`, role: 'TEACHER', isActive: true } }
      },
      include: { user: true }
    });
    res.status(201).json(newTeacher);
  } catch (error) {
    console.error("POST_TEACHERS_ERROR:", error);
    res.status(500).json({ error: "Failed to create teacher" });
  }
});

// مسار تعديل بيانات معلم
app.put("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;

    const updatedTeacher = await prisma.teacher.update({
      where: { id: id },
      data: {
        nameAr, nameEn, specialization, status, paymentMethod,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        percentageRate: percentageRate ? parseFloat(percentageRate) : null,
        user: { update: { email: email } } // تحديث الإيميل في جدول المستخدمين المرتبط
      },
      include: { user: true }
    });
    res.status(200).json(updatedTeacher);
  } catch (error) {
    console.error("PUT_TEACHER_ERROR:", error);
    res.status(500).json({ error: "Failed to update teacher" });
  }
});

// مسار حذف معلم
app.delete("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: id } });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("DELETE_TEACHER_ERROR:", error);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

// ==========================================
// تشغيل السيرفر
// ==========================================
if (process.env.NODE_ENV !== "production") {
  app.listen(8080, () => console.log("Server running on port 8080"));
}

export default app;