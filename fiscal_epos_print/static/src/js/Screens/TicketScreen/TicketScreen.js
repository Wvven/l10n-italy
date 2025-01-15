/** @odoo-module **/
import {patch} from "web.utils";

const TicketScreen = require("point_of_sale.TicketScreen");

patch(TicketScreen.prototype, {
    async onDoRefund() {
        const selected_order = this.getSelectedOrder();
        const res = super.onDoRefund();
        const new_order = this.pos.get_order();
        new_order.refund_report = selected_order.fiscal_z_rep_number;
        new_order.refund_doc_num = selected_order.fiscal_receipt_number;
        new_order.refund_date = selected_order.fiscal_receipt_date;
        new_order.refund_cash_fiscal_serial = selected_order.fiscal_printer_serial;
        return res;
    },

    onDoFullRefund() {
        const res = super.onDoFullRefund();
        const new_order = this.pos.get_order();
        new_order.refund_full_refund = true;
        return res;
    }
});