import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

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
      }, include: { user: true }
    });
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: "Failed to create student" });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, email, nationality, status } = req.body;
    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: {
        nameAr, nameEn, nationality, status,
        user: { update: { email: email } }
      }, include: { user: true }
    });
    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("PUT_STUDENT_ERROR:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({ where: { id: id } });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE_STUDENT_ERROR:", error);
    res.status(500).json({ error: "Failed to delete student" });
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
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

app.post("/teachers", async (req, res) => {
  try {
    const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;
    const newTeacher = await prisma.teacher.create({
      data: {
        nameAr, nameEn, specialization, status: status || 'ACTIVE', paymentMethod: paymentMethod || 'HOURLY',
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null, percentageRate: percentageRate ? parseFloat(percentageRate) : null,
        user: { create: { email: email || `teacher-${Date.now()}@academy.com`, role: 'TEACHER', isActive: true } }
      }, include: { user: true }
    });
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ error: "Failed to create teacher" });
  }
});

app.put("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, email, specialization, paymentMethod, hourlyRate, percentageRate, status } = req.body;
    const updatedTeacher = await prisma.teacher.update({
      where: { id: id },
      data: {
        nameAr, nameEn, specialization, status, paymentMethod,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null, percentageRate: percentageRate ? parseFloat(percentageRate) : null,
        user: { update: { email: email } }
      }, include: { user: true }
    });
    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
});

app.delete("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: id } });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

// ==========================================
// مسار تسجيل الدخول (Login API) المفقود
// ==========================================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(404).json({ error: "البريد الإلكتروني غير مسجل لدينا" });
    }

    // 2. التحقق من كلمة المرور
    if (user.password !== password) {
      return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    }

    // 3. التحقق من حالة الحساب
    if (!user.isActive) {
      return res.status(403).json({ error: "هذا الحساب موقوف، يرجى مراجعة الإدارة" });
    }

    // 4. جلب الاسم حسب الدور (طالب أو معلم)
    let profileName = 'مدير النظام';
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
      if (teacher) profileName = teacher.nameAr;
    } else if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) profileName = student.nameAr;
    }

    // 5. إرسال بيانات الدخول بنجاح
    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profileName
      }
    });

  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    res.status(500).json({ error: "حدث خطأ في الخادم أثناء تسجيل الدخول" });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(8080, () => console.log("Server running on port 8080"));
}

export default app;