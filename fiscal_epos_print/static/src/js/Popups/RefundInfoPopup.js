/** @odoo-module **/

import { useRef, useState } from '@odoo/owl';
import { AbstractAwaitablePopup } from '@point_of_sale/app/popup/abstract_awaitable_popup';
import { _t } from '@web/core/l10n/translation';
import { registry } from '@web/core/registry';

class RefundInfoPopup extends AbstractAwaitablePopup {
    setup() {
        super.setup();
        this.state = useState({ inputValue: this.props.startingValue });
        this.inputRefundReport = useRef("inputRefundReport");
        this.inputRefundDate = useRef("inputRefundDate");
        this.inputRefundDocNum = useRef("inputRefundDocNum");
        this.inputRefundCashFiscalSerial = useRef("inputRefundCashFiscalSerial");
        this.inputRefundFullRefund = useRef("inputRefundFullRefund");
        this.inputDatePicker = this.initializeDatePicker();
    }

    clickConfirmRefund() {
        this.$el = $(this.el);
        const allValid = () => {
            return this.$el
                .find("input")
                .not("#refund_full_refund")
                .toArray()
                .every(element => element.value && element.value !== "");
        };

        if (allValid()) {
            this.$el.find("#error-message-dialog").hide();

            const refund_date = this.inputRefundDate.el.value;
            const refund_report = this.inputRefundReport.el.value;
            const refund_doc_num = this.inputRefundDocNum.el.value;
            const refund_cash_fiscal_serial = this.inputRefundCashFiscalSerial.el.value;
            const refund_full_refund = this.inputRefundFullRefund.el.checked;

            this.env.pos.context = {
                refund_details: true,
                refund_date: refund_date,
                refund_report: refund_report,
                refund_doc_num: refund_doc_num,
                refund_cash_fiscal_serial: refund_cash_fiscal_serial,
                refund_full_refund: refund_full_refund,
            };

            order = this.env.pos.set_refund_data(
                refund_date,
                refund_report,
                refund_doc_num,
                refund_cash_fiscal_serial,
                refund_full_refund
            );

            if (this.props.update_refund_info_button && typeof this.props.update_refund_info_button === 'function') {
                this.props.update_refund_info_button();
            }

            this.trigger('close-popup', { popupId: this.props.id });
        } else {
            this.$el.find("#error-message-dialog").show();
        }
    }

    initializeDatePicker() {
        this.$el = $(this.el);
        const element = this.$el.find("#refund_date").get(0);
        if (element && !this.datepicker) {
            this.datepicker = new Pikaday({
                field: element,
            });
        }
    }
}

RefundInfoPopup.template = "RefundInfoPopup";

RefundInfoPopup.defaultProps = {
    confirmText: _t("Ok"),
    cancelText: _t("Cancel"),
    body: "",
};

registry.category("popups").add("RefundInfoPopup", {
    Component: RefundInfoPopup,
    props: {},
});

export default RefundInfoPopup;