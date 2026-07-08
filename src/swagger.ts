export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Tuition Management System API",
    version: "1.0.0",
    description: "API documentation for the 11Plus Tuition Management System. Authenticate with a Bearer JWT token to test endpoints.",
  },
  servers: [
    {
      url: "/api",
      description: "API Base URL (relative to server root)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: <token_value>",
      },
    },
    schemas: {
      Role: {
        type: "string",
        enum: ["ADMIN", "TEACHER", "PARENT", "STUDENT"],
      },
      RequestStatus: {
        type: "string",
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { $ref: "#/components/schemas/Role" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      LoginPayload: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", example: "admin123" },
        },
      },
      ProfileUpdatePayload: {
        type: "object",
        properties: {
          name: { type: "string" },
          contactInfo: { type: "string" },
          address: { type: "string" },
          yearOfExp: { type: "integer" },
          degrees: { type: "string" },
          grade: { type: "string" },
          targetedSchool: { type: "string" },
        },
      },
      UserCreationPayload: {
        type: "object",
        required: ["email", "password", "name", "role"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
          name: { type: "string" },
          role: { $ref: "#/components/schemas/Role" },
          grade: { type: "string", description: "Optional for Student" },
          subjects: { type: "array", items: { type: "string" }, description: "Optional for Teacher" },
          contactInfo: { type: "string", description: "Optional for Teacher/Parent" },
          targetedSchool: { type: "string", description: "Optional for Student" },
          parentEmail: { type: "string", format: "email", description: "Optional for Student link" },
          teacherCodes: { type: "array", items: { type: "string" }, description: "Optional for Student link" },
          studentCodes: { type: "array", items: { type: "string" }, description: "Optional for Parent link" },
        },
      },
      QuestionUpload: {
        type: "object",
        required: ["questionText", "correctAnswer", "questionType"],
        properties: {
          questionText: { type: "string" },
          questionType: { type: "string", example: "TEXT" },
          options: {
            type: "array",
            items: { type: "string" },
            example: ["Option A", "Option B", "Option C", "Option D"],
          },
          correctAnswer: { type: "string", example: "Option A" },
          explanation: { type: "string" },
          difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
          marks: { type: "integer", default: 1 },
          topic: { type: "string", example: "Algebra" },
          subTopic: { type: "string", example: "Linear Equations" },
        },
      },
      BulkQuestionsPayload: {
        type: "object",
        required: ["subject", "questions"],
        properties: {
          subject: { type: "string", example: "Maths" },
          questions: {
            type: "array",
            items: { $ref: "#/components/schemas/QuestionUpload" },
          },
        },
      },
      RespondToRequestPayload: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["ACCEPTED", "REJECTED"] },
        },
      },
      CreateTestPayload: {
        type: "object",
        required: ["studentIds", "subjectId", "title", "type", "duration", "questionIds"],
        properties: {
          studentIds: { type: "array", items: { type: "integer" } },
          subjectId: { type: "integer" },
          title: { type: "string" },
          type: { type: "string", enum: ["DAILY", "WEEKLY", "TOPIC", "MOCK"] },
          duration: { type: "integer", description: "Duration in minutes" },
          questionIds: { type: "array", items: { type: "integer" } },
          dueDate: { type: "string", format: "date-time" },
        },
      },
      SubmitTestPayload: {
        type: "object",
        required: ["answers"],
        properties: {
          answers: {
            type: "object",
            additionalProperties: { type: "string" },
            description: "Map of questionId (string) to selectedAnswer (string)",
            example: { "1": "Option A", "2": "Option C" },
          },
          timeTaken: { type: "integer", description: "Optional time taken in minutes" },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in user",
        description: "Submit email and password to receive JWT credentials and profile details.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginPayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Success",
          },
          400: {
            description: "Bad Request",
          },
          401: {
            description: "Invalid Credentials",
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        description: "Retrieve details and profile information of the currently authenticated user.",
        responses: {
          200: {
            description: "Success",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },
    "/auth/profile": {
      put: {
        tags: ["Auth"],
        summary: "Update current user profile info",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileUpdatePayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Success",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },
    "/admin/users": {
      post: {
        tags: ["Admin"],
        summary: "Create a user account (Admin role required)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCreationPayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Successfully created user",
          },
          400: {
            description: "Bad Request",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden (Admin required)",
          },
        },
      },
    },
    "/admin/questions/bulk": {
      post: {
        tags: ["Admin"],
        summary: "Bulk upload questions to a subject (Admin role required)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkQuestionsPayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Successfully created questions",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden",
          },
        },
      },
    },
    "/admin/questions/topic": {
      get: {
        tags: ["Admin"],
        summary: "Fetch questions by topic (Admin role required)",
        parameters: [
          {
            name: "topic",
            in: "query",
            required: true,
            schema: { type: "string" },
            example: "Algebra",
          },
          {
            name: "subject",
            in: "query",
            required: false,
            schema: { type: "string" },
            example: "Maths",
          },
        ],
        responses: {
          200: {
            description: "List of matching questions",
          },
          400: {
            description: "Missing topic query",
          },
        },
      },
    },
    "/admin/syllabus": {
      get: {
        tags: ["Admin"],
        summary: "Get overview of subjects and topic counts",
        responses: {
          200: {
            description: "Success",
          },
        },
      },
    },
    "/admin/students": {
      get: {
        tags: ["Admin"],
        summary: "Get all student profiles",
        responses: { 200: { description: "Success" } },
      },
    },
    "/admin/teachers": {
      get: {
        tags: ["Admin"],
        summary: "Get all teacher profiles",
        responses: { 200: { description: "Success" } },
      },
    },
    "/admin/parents": {
      get: {
        tags: ["Admin"],
        summary: "Get all parent profiles",
        responses: { 200: { description: "Success" } },
      },
    },
    "/admin/student-parents": {
      get: {
        tags: ["Admin"],
        summary: "Get student-parent relationship mapping rows",
        responses: { 200: { description: "Success" } },
      },
    },
    "/admin/student-teachers": {
      get: {
        tags: ["Admin"],
        summary: "Get student-teacher relationship mapping rows",
        responses: { 200: { description: "Success" } },
      },
    },
    "/admin/parent-teachers": {
      get: {
        tags: ["Admin"],
        summary: "Get parent-teacher relationship mapping rows",
        responses: { 200: { description: "Success" } },
      },
    },
    "/connections/student/join-teacher": {
      post: {
        tags: ["Connections"],
        summary: "Student request to join a teacher using teacherCode",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["teacherCode"],
                properties: { teacherCode: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Success" } },
      },
    },
    "/connections/parent/link-child": {
      post: {
        tags: ["Connections"],
        summary: "Parent link child using studentCode",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentCode"],
                properties: { studentCode: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Success" } },
      },
    },
    "/connections/parent/request-teacher": {
      post: {
        tags: ["Connections"],
        summary: "Parent requests a connection between their student and a teacher",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["studentId", "teacherId"],
                properties: {
                  studentId: { type: "integer" },
                  teacherId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Success" } },
      },
    },
    "/connections/parent/pending-requests": {
      get: {
        tags: ["Connections"],
        summary: "Get pending requests submitted by the logged-in parent",
        responses: { 200: { description: "Success" } },
      },
    },
    "/connections/teacher/requests": {
      get: {
        tags: ["Connections"],
        summary: "Get pending student connection requests for the logged-in teacher",
        responses: { 200: { description: "Success" } },
      },
    },
    "/connections/teacher/requests/{id}/respond": {
      post: {
        tags: ["Connections"],
        summary: "Teacher respond (ACCEPT/REJECT) to a pending connection request",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RespondToRequestPayload" },
            },
          },
        },
        responses: { 200: { description: "Success" } },
      },
    },
    "/connections/teachers": {
      get: {
        tags: ["Connections"],
        summary: "Get all teacher listings details",
        responses: { 200: { description: "Success" } },
      },
    },
    "/teacher/students": {
      get: {
        tags: ["Teacher"],
        summary: "Get list of students linked to this teacher",
        responses: { 200: { description: "Success" } },
      },
    },
    "/teacher/syllabus": {
      get: {
        tags: ["Teacher"],
        summary: "Get syllabus overview",
        responses: { 200: { description: "Success" } },
      },
    },
    "/teacher/questions": {
      get: {
        tags: ["Teacher"],
        summary: "Get list of questions by query",
        parameters: [
          {
            name: "subjectId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
          {
            name: "syllabusId",
            in: "query",
            required: false,
            schema: { type: "integer" },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: { 200: { description: "Success" } },
      },
    },
    "/teacher/tests": {
      get: {
        tags: ["Teacher"],
        summary: "Get tests created by this teacher",
        responses: { 200: { description: "Success" } },
      },
      post: {
        tags: ["Teacher"],
        summary: "Create and assign a test template to students",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTestPayload" },
            },
          },
        },
        responses: { 201: { description: "Success" } },
      },
    },
    "/teacher/students/{studentId}": {
      delete: {
        tags: ["Teacher"],
        summary: "Unlink/Disconnect a student from the teacher's profile",
        parameters: [
          {
            name: "studentId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 200: { description: "Success" } },
      },
    },
    "/student/questions/practice": {
      get: {
        tags: ["Student"],
        summary: "Get random practice questions",
        parameters: [
          {
            name: "subjectId",
            in: "query",
            required: false,
            schema: { type: "integer" },
          },
          {
            name: "syllabusId",
            in: "query",
            required: false,
            schema: { type: "integer" },
          },
          {
            name: "topic",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 5 },
          },
        ],
        responses: { 200: { description: "Success" } },
      },
    },
    "/student/tests/pending": {
      get: {
        tags: ["Student"],
        summary: "Get all pending (STARTED but not submitted) tests for the student",
        responses: { 200: { description: "Success" } },
      },
    },
    "/student/tests/completed": {
      get: {
        tags: ["Student"],
        summary: "Get all completed (SUBMITTED or GRADED) tests for the student",
        responses: { 200: { description: "Success" } },
      },
    },
    "/student/tests/{id}/submit": {
      post: {
        tags: ["Student"],
        summary: "Submit answers for grading a test",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SubmitTestPayload" },
            },
          },
        },
        responses: { 200: { description: "Success" } },
      },
    },
  },
};
