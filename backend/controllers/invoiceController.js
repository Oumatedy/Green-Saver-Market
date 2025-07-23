const invoiceService = require('../services/invoiceService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

class InvoiceController {
  generateInvoice = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.generateInvoice(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    ApiResponse.success(invoice).send(res);
  });
}

module.exports = new InvoiceController();
