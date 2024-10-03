/** @odoo-module **/

import { Component, useState } from '@odoo/owl';
import { useBus } from '@odoo/owl/hooks';

class SetRefundInfoButton extends Component {
    setup() {
        this.state = useState({
            color: '#e2e2e2',
        });

        this.order = this.env.pos.get_order();
        this.updateButtonColor();

        useBus(this.env.pos, 'change:selectedOrder', this.orderlineChange.bind(this));
        this.bindOrderEvents();
    }

    bindOrderEvents() {
        if (!this.order) {
            return;
        }

        if (this.oldOrder) {
            this.oldOrder.unbind(null, null, this);
        }

        useBus(this.env.pos, 'change:selectedOrder', this.orderlineChange.bind(this));

        const lines = this.order.orderlines;
        lines.unbind('add', this.orderlineChange, this);
        lines.bind('add', this.orderlineChange, this);
        lines.unbind('remove', this.orderlineChange, this);
        lines.bind('remove', this.orderlineChange, this);
        lines.unbind('change', this.orderlineChange, this);
        lines.bind('change', this.orderlineChange, this);

        this.oldOrder = this.order;
    }

    updateButtonColor() {
        const order = this.env.pos.get_order();
        let color = '#e2e2e2';
        if (order) {
            const lines = order.orderlines;
            const hasRefund = lines.find(line => line.quantity < 0.0) !== undefined;
            if (hasRefund) {
                if (order.refund_date && order.refund_doc_num && order.refund_cash_fiscal_serial && order.refund_report) {
                    color = 'lightgreen';
                } else {
                    color = 'red';
                }
            }
        }
        this.state.color = color;
    }

    orderlineChange() {
        this.order = this.env.pos.get_order();
        if (this.order) {
            const lines = this.order.orderlines;
            this.order.has_refund = lines.find(line => line.quantity < 0.0) !== undefined;
        }
        this.updateButtonColor();
    }

    onClick() {
        const currentOrder = this.env.pos.get_order();
        this.env.services.gui.showPopup('refundinfo', {
            title: this.env._t('Refund Information Details'),
            refund_date: currentOrder.refund_date,
            refund_report: currentOrder.refund_report,
            refund_doc_num: currentOrder.refund_doc_num,
            refund_cash_fiscal_serial: currentOrder.refund_cash_fiscal_serial,
            update_refund_info_button: () => {
                this.updateButtonColor();
            },
        });
    }

    static template = 'SetRefundInfoButton';
}

SetRefundInfoButton.template = 'SetRefundInfoButton';

export default SetRefundInfoButton;