# @author: Valerio Paretta <valerioparetta@innovyou.it>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, models
from odoo.exceptions import UserError


class AccountMove(models.Model):
    _inherit = "account.move"

    def _post(self, soft=True):   

        if self.env.context.get('skip_must_have_dates'):
            product_ids = self.mapped('line_ids.product_id')
            product_ids.write({'must_have_dates': False})
            return super()._post(soft=soft)

    def generate_supplier_self_invoice(self):
        self.ensure_one()
        if self.type != 'in_invoice':
            raise UserError(_("This feature is only available for supplier invoices"))
        self = self.with_context(skip_must_have_dates=True)
        return super().generate_supplier_self_invoice()

    def generate_self_invoice(self):
        self.ensure_one()
        if self.type != 'out_invoice':
            raise UserError(_("This feature is only available for customer invoices"))
        self = self.with_context(skip_must_have_dates=True)
        return super().generate_self_invoice()