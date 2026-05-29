import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// مسار الفحص
app.get("/health", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running!" });
});

// مسار جلب الطلاب
app.get("/students", async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: true }
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("GET_STUDENTS_ERROR:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// مسار إضافة طالب جديد
app.post("/students", async (req, res) => {
  try {
    const { nameAr, nameEn, email, nationality, status } = req.body;
    const newStudent = await prisma.student.create({
      data: {
        nameAr,
        nameEn,
        status: status || 'LEAD',
        nationality,
        user: {
          create: {
            email: email || `user-${Date.now()}@academy.com`,
            role: 'STUDENT',
            isActive: true
          }
        }
      },
      include: { user: true }
    });
    res.status(201).json(newStudent);
  } catch (error) {
    // هذا السطر مهم جداً لكشف أي خطأ في قاعدة البيانات
    console.error("PRISMA_ERROR:", error); 
    res.status(500).json({ error: "Failed to create student" });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(8080, () => console.log("Server running on port 8080"));
}

export default app;