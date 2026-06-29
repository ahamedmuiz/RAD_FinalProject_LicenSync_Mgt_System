"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clientController_1 = require("../controllers/clientController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use(authMiddleware_1.projectManagerOnly);
router.route('/')
    .post(clientController_1.createClient)
    .get(clientController_1.getClients);
router.route('/:id')
    .put(clientController_1.updateClient)
    .delete(clientController_1.deleteClient);
exports.default = router;
