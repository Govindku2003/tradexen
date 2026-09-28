import { EXECUTION_STATUS } from "./execution.types.js";

class PaperExecutionService {
  execute(order) {
    if (!order) {
      return {
        status: EXECUTION_STATUS.REJECTED,
        reason: "Order data is required",
      };
    }

    if (!order.symbol) {
      return {
        status: EXECUTION_STATUS.REJECTED,
        reason: "Symbol is required",
      };
    }

    if (!order.side) {
      return {
        status: EXECUTION_STATUS.REJECTED,
        reason: "Order side is required",
      };
    }

    if (!order.quantity || order.quantity <= 0) {
      return {
        status: EXECUTION_STATUS.REJECTED,
        reason: "Valid quantity is required",
      };
    }

    return {
      status: EXECUTION_STATUS.ACCEPTED,
      mode: "PAPER",
      message: "Paper order accepted for execution",
      order,
      executedAt: new Date().toISOString(),
    };
  }
}

const paperExecutionService =
  new PaperExecutionService();

export default paperExecutionService;