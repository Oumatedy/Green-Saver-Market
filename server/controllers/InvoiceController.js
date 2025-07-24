const invoiceService = require('../services/invoiceService');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');

class InvoiceController extends BaseController {
  constructor() {
    super();
  }

  generateInvoice = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.generateInvoice(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    if (!invoice) {
      return this.notFound(res, 'Invoice not found or could not be generated');
    }

    this.ok(res, invoice);
  });
}

module.exports = new InvoiceController();
