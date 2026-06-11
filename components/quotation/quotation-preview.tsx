'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Project, Quotation, BomItem, QuotationItem } from '@/types/database'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  quotation: Quotation
  project: Project
  bomItems: BomItem[]
}

export function QuotationPreview({ open, onOpenChange, quotation, project, bomItems }: Props) {
  const isVN = quotation.lang === 'vn'
  const items = (quotation.items ?? []) as QuotationItem[]
  const today = new Date(quotation.created_at)
  const validUntil = new Date(today.getTime() + quotation.validity_days * 86400000)

  // Map bom items by id
  const bomMap = Object.fromEntries(bomItems.map(b => [b.id, b]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Xem báo giá — Rev {quotation.revision} ({isVN ? 'VN' : 'EN'})</span>
            <Button size="sm" variant="outline" asChild>
              <a href={`/api/export/pdf?quotId=${quotation.id}`} target="_blank">
                <Download size={14} className="mr-1" />Xuất PDF
              </a>
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm" id="quotation-print">
          {/* Header */}
          <div className="grid grid-cols-2 gap-6 border-b pb-4">
            <div>
              <p className="font-bold text-base">CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC</p>
              <p className="text-gray-500">Số 41 Đường số 7, KCN Việt Nam-Singapore III</p>
              <p className="text-gray-500">Phường Tân Uyên, TP. Hồ Chí Minh, Việt Nam</p>
              <p className="text-gray-500">Tel: +84 274 3543 574 | Fax: +84 274 3543 572</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xl font-bold text-indigo-700">
                {isVN ? 'BẢNG BÁO GIÁ' : 'QUOTATION'}
              </p>
              <p><span className="text-gray-500">{isVN ? 'Số báo giá:' : 'Ref #:'}</span> <span className="font-mono">{project.code}-{String(quotation.revision).padStart(2, '0')}</span></p>
              <p><span className="text-gray-500">{isVN ? 'Ngày:' : 'Date:'}</span> {today.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')}</p>
              <p><span className="text-gray-500">{isVN ? 'Hiệu lực đến:' : 'Valid until:'}</span> {validUntil.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')}</p>
              <p><span className="text-gray-500">Rev:</span> {quotation.revision}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded p-3">
            <p className="text-gray-500 text-xs mb-1">{isVN ? 'Kính gửi:' : 'To:'}</p>
            <p className="font-medium">{project.customer_name}</p>
            {project.customer_contact && <p className="text-gray-600">{project.customer_contact}</p>}
            {project.customer_email && <p className="text-gray-600">{project.customer_email}</p>}
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="border border-indigo-500 p-2 text-left">#</th>
                <th className="border border-indigo-500 p-2 text-left">{isVN ? 'Mã sản phẩm' : 'P/N'}</th>
                <th className="border border-indigo-500 p-2 text-left">{isVN ? 'Nguyên liệu' : 'Material'}</th>
                <th className="border border-indigo-500 p-2 text-center">{isVN ? 'Cav' : 'Cav'}</th>
                <th className="border border-indigo-500 p-2 text-right">{isVN ? 'Giá khuôn (VND)' : 'Mold (VND)'}</th>
                <th className="border border-indigo-500 p-2 text-right">{isVN ? 'Đơn giá VND/cái' : 'Price USD/pc'}</th>
                <th className="border border-indigo-500 p-2 text-right">MOQ 500</th>
                <th className="border border-indigo-500 p-2 text-right">MOQ 1000</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const bom = bomMap[item.bom_item_id]
                return (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 p-2">{i + 1}</td>
                    <td className="border border-gray-200 p-2 font-mono">{bom?.part_number ?? '—'}</td>
                    <td className="border border-gray-200 p-2">
                      {bom?.material?.name}{bom?.material_spec ? ` — ${bom.material_spec}` : ''}
                      {bom?.color && ` (${bom.color})`}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">{bom?.cavity}</td>
                    <td className="border border-gray-200 p-2 text-right font-mono">
                      {item.tool_price_vnd > 0 ? new Intl.NumberFormat('vi-VN').format(item.tool_price_vnd) : '—'}
                    </td>
                    <td className="border border-gray-200 p-2 text-right font-mono font-semibold text-indigo-700">
                      {isVN
                        ? new Intl.NumberFormat('vi-VN').format(item.unit_price_vnd)
                        : item.unit_price_usd.toFixed(4)
                      }
                    </td>
                    <td className="border border-gray-200 p-2 text-right font-mono">
                      {isVN
                        ? new Intl.NumberFormat('vi-VN').format(item.unit_price_vnd)
                        : item.unit_price_usd.toFixed(4)
                      }
                    </td>
                    <td className="border border-gray-200 p-2 text-right font-mono">
                      {isVN
                        ? new Intl.NumberFormat('vi-VN').format(Math.ceil(item.unit_price_vnd * 0.92))
                        : (item.unit_price_usd * 0.92).toFixed(4)
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Notes */}
          <div className="text-xs space-y-1 text-gray-600">
            {isVN ? (
              <>
                <p>* Giá trên chưa bao gồm thuế VAT</p>
                <p>* Giao hàng tại kho GPMI cho đơn hàng từ 50.000.000 đồng</p>
                <p>* Đóng gói: Túi PP / thùng carton</p>
                <p>* Thời gian hoàn thành khuôn: {quotation.delivery_mold_days} ngày làm việc kể từ ngày nhận PO</p>
                <p>* Thời gian sản xuất sản phẩm: {quotation.delivery_production_days} ngày làm việc kể từ ngày nhận PO</p>
                <p>* Khuôn: Đặt cọc {quotation.payment_mold_deposit}% khi nhận PO</p>
              </>
            ) : (
              <>
                <p>+ Price excludes VAT</p>
                <p>+ Incoterm: {quotation.incoterm}</p>
                <p>+ Packaging: Carton</p>
                <p>+ Mold lead time: {quotation.delivery_mold_days} working days from PO</p>
                <p>+ Production lead time: {quotation.delivery_production_days} working days from PO</p>
                <p>+ Mold payment: {quotation.payment_mold_deposit}% T/T in advance</p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
