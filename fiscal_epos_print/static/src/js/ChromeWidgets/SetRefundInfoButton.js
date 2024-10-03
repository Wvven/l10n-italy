/** @odoo-module **/

import { Component, useState, useRef } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";

class SetRefundInfoButton extends Component {
    setup() {
        this.state = useState({
            color: "#e2e2e2",
        });
        this.pos = useService("pos");
        this.bind_order_events();
        this.orderline_change();
    }

    bind_order_events() {
        const order = this.pos.get_order();

        if (!order) {
            return;
        }

        if (this.old_order) {
            this.old_order.unbind(null, null, this);
        }

        this.pos.on("change:selectedOrder", this.orderline_change, this);

        const lines = order.orderlines;
        lines.unbind("add", this.orderline_change, this);
        lines.bind("add", this.orderline_change, this);
        lines.unbind("remove", this.orderline_change, this);
        lines.bind("remove", this.orderline_change, this);
        lines.unbind("change", this.orderline_change, this);
        lines.bind("change", this.orderline_change, this);

        this.old_order = order;
    }

    orderline_change() {
        const order = this.pos.get_order();
        if (order) {
            const lines = order.orderlines;
            order.has_refund = lines.find(line => line.quantity < 0.0) !== undefined;
        }
        this.state.color = this.refund_get_button_color();
    }

    refund_get_button_color() {
        const order = this.pos.get_order();
        let color = "#e2e2e2";
        if (order) {
            const lines = order.orderlines;
            const has_refund = lines.find(line => line.quantity < 0.0) !== undefined;
            if (has_refund) {
                if (
                    order.refund_date &&
                    order.refund_date !== "" &&
                    order.refund_doc_num &&
                    order.refund_doc_num !== "" &&
                    order.refund_cash_fiscal_serial &&
                    order.refund_cash_fiscal_serial !== "" &&
                    order.refund_report &&
                    order.refund_report !== ""
                ) {
                    color = "lightgreen";
                } else {
                    color = "red";
                }
            }
        }
        return color;
    }

    async onClickRefund() {
        const current_order = this.pos.get_order();
        if (!current_order.refund_date) {
            this.showPopup("ErrorPopup", {
                title: _t("Error"),
                body: _t("Must select a refund order before clicking on this button!"),
            });
            return;
        }
        const dd = ("0" + current_order.refund_date.getDate()).slice(-2);
        const mm = ("0" + (current_order.refund_date.getMonth() + 1)).slice(-2);
        const yyyy = current_order.refund_date.getFullYear();
        this.showPopup("RefundInfoPopup", {
            title: _t("Refund Information Details"),
            refund_date: `${yyyy}-${mm}-${dd}`,
            refund_report: current_order.refund_report,
            refund_doc_num: current_order.refund_doc_num,
            refund_cash_fiscal_serial: current_order.refund_cash_fiscal_serial,
            update_refund_info_button: () => {
                this.state.color = this.refund_get_button_color();
            },
        });
    }

    is_available() {
        return this.pos.get_order();
    }

    render() {
        this.el.style.background = this.state.color;
    }
}

SetRefundInfoButton.template = "SetRefundInfoButton";

registry.category("pos.components").add("SetRefundInfoButton", SetRefundInfoButton);

export default SetRefundInfoButton;