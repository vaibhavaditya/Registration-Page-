import { Router } from "express";
import fs from "fs";
import { registrationDetails } from "../controllers/scraped.controller.js";

const router = Router();

router.route('/registrationScrape').get(registrationDetails);

export default router;