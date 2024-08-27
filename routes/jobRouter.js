import express from "express";
const router = express.Router();
import { getAllJobs, createJob, updateJob, deleteJob, getSingleJob, showStats } from "../controllers/jobController.js";
import { validateJobInput, validateIdParam } from "../middleware/validationMiddleware.js";
import { checkForTestUser } from "../middleware/authMiddleware.js";

// remember each of thes is relative to /api/v1/jobs
router.get("/", getAllJobs);
router.post("/", checkForTestUser, validateJobInput, createJob);
router.get("/stats", showStats);
router.get("/:id", validateIdParam, getSingleJob);
router.patch("/:id", checkForTestUser, validateIdParam, validateJobInput, updateJob);
router.delete("/:id", checkForTestUser, validateIdParam, deleteJob);

/*
We could also write these like this:
  router.route("/").get(getAllJobs).post(createJob);
  router.route("/:id").get(getSingleJobs).patch(updateJob).delete(deleteJob);
*/

export default router;