'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calcCost, formatVND, formatUSD } from '@/lib/costing'
import type { BomItem, CostSettings } from '@/types/database'

interface Props {
  bomItems: BomItem[]
  costSettings: CostSettings
}

export function CostingView({ bomItems, costSettings }: Props) {
  if (bomItems.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-gray-400">
          Chưa có BOM. Thêm chi tiết nhựa ở tab BOM trước.
        </CardContent>
      </Card>
    )
  }

  if (!costSettings) {
    return <Card><CardContent className="py-8 text-center text-gray-400">Chưa có thông số chi phí.</CardContent></Card>
  }

  const costs = bomItems.map(item => ({ item, cost: calcCost(item, costSettings) }))

  const overheadPct = (costSettings.overhead_factory + costSettings.overhead_qc + costSettings.overhead_packaging + costSettings.overhead_admin + costSettings.overhead_shipping + costSettings.overhead_profit) * 100

  return (
    <div className="space-y-4">
      {/* Thông số hệ thống */}
      <Card>
        <CardHeader><CardTitle className="text-sm text-gray-600">Thông số tính giá hiện tại</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 text-xs">Lương/tháng</div>
            <div className="font-medium">{formatVND(costSettings.labor_cost_per_month)}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 text-xs">Giá điện</div>
            <div className="font-medium">{costSettings.electricity_price.toLocaleString()} đ/kWh</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 text-xs">Tỷ giá USD</div>
            <div className="font-medium">{costSettings.usd_rate.toLocaleString()} đ/$</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-gray-500 text-xs">Tổng overhead</div>
            <div className="font-medium">{overheadPct.toFixed(0)}%</div>
          </div>
        </CardContent>
      </Card>

      {/* Bảng chi phí */}
      {costs.map(({ item, cost }) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50 py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {item.part_number && <span className="font-mono text-indigo-700 mr-2">{item.part_number}</span>}
              {item.part_name ?? 'Chi tiết'}
              {item.color && <span className="ml-2 text-gray-500">— {item.color}</span>}
            </CardTitle>
            <div className="flex gap-4 text-sm">
              <span className="font-bold text-green-700">
                {formatVND(cost.unit_price_vnd)} / cái
              </span>
              <span className="text-gray-500">
                {formatUSD(cost.unit_price_usd)} / pc
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x text-sm">
              {/* Chi phí gia công */}
              <div className="p-4 space-y-2">
                <p className="font-medium text-gray-700 border-b pb-1">Chi phí gia công / sản phẩm</p>
                <Row label="Điện" value={formatVND(cost.electricity_cost_per_shot)} />
                <Row label="Khấu hao máy" value={formatVND(cost.depreciation_cost_per_shot)} />
                <Row label="Nhân công" value={formatVND(cost.labor_cost_per_shot)} />
                <Row label="Tổng gia công" value={formatVND(cost.processing_cost_per_pc)} bold />
              </div>
              {/* Nguyên vật liệu */}
              <div className="p-4 space-y-2">
                <p className="font-medium text-gray-700 border-b pb-1">Nguyên vật liệu / sản phẩm</p>
                <Row label={`Nhựa (${item.material?.name ?? '?'}, ${item.weight_g}g)`} value={formatVND(cost.resin_cost_per_pc)} />
                {cost.colorant_cost_per_pc > 0 && <Row label="Bột màu" value={formatVND(cost.colorant_cost_per_pc)} />}
                {cost.ink_cost_per_pc > 0 && <Row label="Mực in" value={formatVND(cost.ink_cost_per_pc)} />}
                <Row label="Tổng NVL" value={formatVND(cost.material_cost_per_pc)} bold />
              </div>
            </div>
            {/* Tổng kết */}
            <div className="bg-indigo-50 p-4 grid grid-cols-4 gap-4 text-sm border-t">
              <div>
                <div className="text-gray-500">Giá thành cơ bản</div>
                <div className="font-semibold">{formatVND(cost.base_cost_per_pc)}</div>
              </div>
              <div>
                <div className="text-gray-500">Overhead ({(cost.total_overhead_pct * 100).toFixed(0)}%)</div>
                <div className="font-semibold">{formatVND(cost.base_cost_per_pc * cost.total_overhead_pct)}</div>
              </div>
              <div>
                <div className="text-gray-500">Giá bán VND</div>
                <div className="font-bold text-green-700 text-base">{formatVND(cost.unit_price_vnd)}</div>
              </div>
              <div>
                <div className="text-gray-500">Giá bán USD</div>
                <div className="font-bold text-blue-700 text-base">{formatUSD(cost.unit_price_usd)}</div>
              </div>
            </div>
            <div className="px-4 py-2 text-xs text-gray-400 border-t bg-gray-50">
              Năng suất: {cost.capacity_daily.toFixed(0)} sp/ngày · {cost.capacity_monthly.toFixed(0)} sp/tháng
              · Máy: {item.machine?.code ?? '?'} ({item.machine?.tonnage ?? '?'}T)
              · Cavity: {item.cavity} · Chu kỳ: {item.cycle_time_s}s
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold border-t pt-1' : 'text-gray-600'}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
