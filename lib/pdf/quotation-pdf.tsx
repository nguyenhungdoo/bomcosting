import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import path from 'path'
import fs from 'fs'

const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Regular.ttf')
if (fs.existsSync(fontPath)) {
  Font.register({
    family: 'NotoSans',
    fonts: [
      { src: fontPath, fontWeight: 400 },
      { src: fontPath, fontWeight: 700 },
    ],
  })
}

const FONT = fs.existsSync(fontPath) ? 'NotoSans' : 'Helvetica'
const FONT_BOLD = fs.existsSync(fontPath) ? 'NotoSans' : 'Helvetica-Bold'

const BLUE = '#1e5ab4'
const DARK = '#0a1628'
const GRAY = '#64748b'
const BODY = '#374151'
const LIGHT_BG = '#f8fafc'
const BLUE_BG = '#f0f6ff'
const BORDER = '#e2e8f0'
const BLUE_BORDER = '#bfdbfe'

const s = StyleSheet.create({
  page: { fontFamily: FONT, fontSize: 9, color: '#333', padding: '14mm 16mm', flexDirection: 'column' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 10, borderBottomWidth: 3, borderBottomColor: BLUE, marginBottom: 14 },
  companyName: { fontSize: 11, fontFamily: FONT_BOLD, fontWeight: 700, color: DARK },
  companyInfo: { fontSize: 8, color: '#475569', marginTop: 3, lineHeight: 1.7 },
  quotTitle: { fontSize: 18, fontFamily: FONT_BOLD, fontWeight: 700, color: BLUE, textAlign: 'right', letterSpacing: 1 },
  refRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2 },
  refLabel: { color: GRAY, fontSize: 8.5, width: 85, textAlign: 'right', paddingRight: 6 },
  refValue: { fontFamily: FONT_BOLD, fontWeight: 700, color: DARK, fontSize: 8.5, width: 105 },

  customer: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: BLUE_BG, borderWidth: 1, borderColor: BLUE_BORDER, borderRadius: 6, padding: '10 14', marginBottom: 14 },
  custLogo: { width: 56, height: 56, borderRadius: 6, borderWidth: 1, borderColor: BLUE_BORDER, backgroundColor: 'white' },
  custFields: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  custField: { width: '50%', flexDirection: 'row', marginBottom: 3, fontSize: 9 },
  custFieldFull: { width: '100%', flexDirection: 'row', marginBottom: 3, fontSize: 9 },
  custLabel: { color: GRAY },
  custValue: { fontFamily: FONT_BOLD, fontWeight: 700, color: DARK },

  table: { marginBottom: 14 },
  thRow: { flexDirection: 'row', backgroundColor: DARK },
  th: { color: 'white', fontSize: 7.5, fontFamily: FONT_BOLD, fontWeight: 700, padding: '5 4', textAlign: 'center' },
  tr: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: BORDER },
  trAlt: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: BORDER, backgroundColor: LIGHT_BG },
  td: { fontSize: 8, padding: '4 4', color: BODY },
  tdBold: { fontSize: 8, padding: '4 4', fontFamily: FONT_BOLD, fontWeight: 700, color: BLUE },
  tdPn: { fontSize: 8, padding: '4 4', fontFamily: FONT_BOLD, fontWeight: 700, color: DARK },
  tdSub: { fontSize: 7.5, color: BODY },

  termsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  termsBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: '10 12' },
  termsBoxBlue: { flex: 1, borderWidth: 1, borderColor: BLUE_BORDER, borderRadius: 6, padding: '10 12', backgroundColor: BLUE_BG },
  termsTitle: { fontSize: 8, fontFamily: FONT_BOLD, fontWeight: 700, color: DARK, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  termsBody: { fontSize: 8.5, color: BODY, lineHeight: 1.9 },
  termsSub: { fontFamily: FONT_BOLD, fontWeight: 700, color: BLUE },

  sigGrid: { flexDirection: 'row', gap: 16 },
  sigBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: '12 16', alignItems: 'center' },
  sigBoxSeller: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: '12 16', alignItems: 'center', backgroundColor: LIGHT_BG },
  sigTitle: { fontSize: 9, fontFamily: FONT_BOLD, fontWeight: 700, color: BODY, marginBottom: 3 },
  sigNote: { fontSize: 8, color: '#94a3b8', marginBottom: 40 },
  sigName: { fontSize: 9, fontFamily: FONT_BOLD, fontWeight: 700, color: DARK },
  sigSub: { fontSize: 8, color: GRAY },
})

const COL_W = ['5%', '26%', '16%', '11%', '14%', '14%', '14%']

const fmtUSD = (n: number) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

interface QuotationPDFProps {
  quotation: any
  project: any
  bomItems: any[]
}

export function QuotationPDF({ quotation, project, bomItems }: QuotationPDFProps) {
  const isVN = quotation.lang === 'vn'
  const items = quotation.items ?? []
  const today = new Date(quotation.created_at)
  const validUntil = new Date(today.getTime() + quotation.validity_days * 86400000)
  const bomMap = Object.fromEntries((bomItems ?? []).map((b: any) => [b.id, b]))
  const refNo = `${project?.code}-Rev${String(quotation.revision).padStart(2, '0')}`

  const headers = [
    'No',
    isVN ? 'Mã SP & tên' : 'P/N & name',
    isVN ? 'Vật liệu / màu' : 'Material / color',
    isVN ? 'Cavity / khuôn' : 'Cavity / mold',
    isVN ? 'Giá khuôn (USD)' : 'Mold cost (USD)',
    isVN ? 'Đơn giá (USD)' : 'Part cost (USD)',
    'MOQ / EAU',
  ]

  const hasLogo = !!project?.customer_logo_url

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={s.page}>
        {/* HEADER */}
        <View style={s.header}>
          <View style={{ maxWidth: '55%' }}>
            <Text style={s.companyName}>
              {isVN ? 'CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC' : 'ELASTEC INDUSTRIAL JOINT STOCK COMPANY'}
            </Text>
            <Text style={s.companyInfo}>
              {isVN
                ? 'Số 41 Đường số 7, KCN Việt Nam–Singapore III, Tân Uyên, Bình Dương\nTel: +84 274 3543 574  |  Fax: +84 274 3543 572'
                : 'No. 41 Street 7, VSIP III, Tan Uyen, Binh Duong, Vietnam\nTel: +84 274 3543 574  |  Fax: +84 274 3543 572'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.quotTitle}>{isVN ? 'BÁO GIÁ' : 'QUOTATION'}</Text>
            {([
              [isVN ? 'Số báo giá' : 'Quotation No.', refNo],
              [isVN ? 'Ngày' : 'Date', today.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')],
              [isVN ? 'Hiệu lực đến' : 'Valid until', validUntil.toLocaleDateString(isVN ? 'vi-VN' : 'en-GB')],
              ['Rev', String(quotation.revision)],
            ] as [string, string][]).map(([label, val]) => (
              <View key={label} style={s.refRow}>
                <Text style={s.refLabel}>{label}:</Text>
                <Text style={s.refValue}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CUSTOMER */}
        <View style={s.customer}>
          {hasLogo && (
            <Image src={project.customer_logo_url} style={s.custLogo} />
          )}
          <View style={s.custFields}>
            <View style={s.custField}>
              <Text style={s.custLabel}>{isVN ? 'Kính gửi' : 'Attention'}: </Text>
              <Text style={s.custValue}>{project?.customer_name ?? ''}</Text>
            </View>
            {project?.customer_contact && (
              <View style={s.custField}>
                <Text style={s.custLabel}>{isVN ? 'Liên hệ' : 'Contact'}: </Text>
                <Text>{project.customer_contact}</Text>
              </View>
            )}
            {project?.customer_phone && (
              <View style={s.custField}>
                <Text style={s.custLabel}>{isVN ? 'Điện thoại' : 'Phone'}: </Text>
                <Text>{project.customer_phone}</Text>
              </View>
            )}
            {project?.customer_email && (
              <View style={s.custField}>
                <Text style={s.custLabel}>Email: </Text>
                <Text>{project.customer_email}</Text>
              </View>
            )}
            {project?.customer_address && (
              <View style={s.custFieldFull}>
                <Text style={s.custLabel}>{isVN ? 'Địa chỉ' : 'Address'}: </Text>
                <Text>{project.customer_address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* TABLE */}
        <View style={s.table}>
          <View style={s.thRow}>
            {headers.map((h, i) => (
              <Text key={i} style={[s.th, { width: COL_W[i], textAlign: i === 1 || i === 2 ? 'left' : 'center' }]}>{h}</Text>
            ))}
          </View>
          {items.map((item: any, i: number) => {
            const bom = bomMap[item.bom_item_id]
            const matAbbr = bom?.material?.code || bom?.material?.name || '—'
            const color = bom?.color || ''
            const matColor = color ? `${matAbbr} / ${color}` : matAbbr
            const cavInfo = bom?.cavity != null ? `${bom.cavity} cav` : '—'
            const moq = quotation.moq_500 || 500
            const eau = quotation.moq_1000 || ''

            const row = [
              String(i + 1),
              '', // handled separately for 2-line P/N + name
              matColor,
              cavInfo,
              item.tool_price_usd > 0 ? fmtUSD(item.tool_price_usd) : '—',
              fmtUSD(item.unit_price_usd),
              eau ? `${moq.toLocaleString()} / ${eau.toLocaleString()}` : String(moq.toLocaleString()),
            ]

            return (
              <View key={item.id ?? i} style={i % 2 === 0 ? s.tr : s.trAlt}>
                {row.map((cell, ci) => {
                  if (ci === 1) {
                    return (
                      <View key={ci} style={{ width: COL_W[ci], padding: '4 4' }}>
                        <Text style={s.tdPn}>{bom?.part_number ?? '—'}</Text>
                        <Text style={s.tdSub}>{bom?.part_name ?? ''}</Text>
                      </View>
                    )
                  }
                  const isPrice = ci === 4 || ci === 5
                  return (
                    <Text
                      key={ci}
                      style={[
                        isPrice ? s.tdBold : s.td,
                        {
                          width: COL_W[ci],
                          textAlign: ci === 0 || ci === 6 ? 'center' : ci >= 4 ? 'right' : 'left',
                        },
                      ]}
                    >
                      {cell}
                    </Text>
                  )
                })}
              </View>
            )
          })}
        </View>

        {/* TERMS */}
        <View style={s.termsGrid}>
          <View style={s.termsBox}>
            <Text style={s.termsTitle}>{isVN ? 'Điều khoản & điều kiện' : 'Terms & conditions'}</Text>
            <Text style={s.termsBody}>
              {isVN
                ? `✦ Giá chưa bao gồm thuế VAT 10% và phí test report (nếu có)\n✦ Thời gian làm khuôn: ${quotation.delivery_mold_days} ngày làm việc từ khi nhận PO\n✦ Thời gian làm mẫu T1: ${quotation.delivery_sample_days} ngày sau khi hoàn thành khuôn\n✦ Thời gian sản xuất: ${quotation.delivery_production_days} ngày làm việc từ khi nhận PO\n✦ Đóng gói: Túi PP / thùng carton tiêu chuẩn\n✦ Giao hàng: ${quotation.incoterm || 'EXW kho ELASTEC, Bình Dương'}\n✦ Vật liệu khuôn: NAK80 / S136H\n✦ Tuổi thọ khuôn: 300,000 shots\n✦ Báo giá có hiệu lực ${quotation.validity_days} ngày kể từ ngày phát hành`
                : `✦ Price excludes 10% VAT and test report fee, if any\n✦ Mold lead time: ${quotation.delivery_mold_days} working days from PO\n✦ T1 sample lead time: ${quotation.delivery_sample_days} days after mold completion\n✦ Production lead time: ${quotation.delivery_production_days} working days from PO\n✦ Packaging: PP bag / standard carton\n✦ Incoterm: ${quotation.incoterm || 'EXW ELASTEC, Binh Duong'}\n✦ Mold material: NAK80 / S136H\n✦ Mold service life: 300,000 shots\n✦ Quotation valid for ${quotation.validity_days} days from date of issue`}
            </Text>
          </View>
          <View style={s.termsBoxBlue}>
            <Text style={s.termsTitle}>{isVN ? 'Điều khoản thanh toán' : 'Payment terms'}</Text>
            <Text style={s.termsBody}>
              {isVN
                ? `KHUÔN MẪU:\n✦ Đặt cọc ${quotation.payment_mold_deposit}% khi ký hợp đồng / nhận PO\n✦ Thanh toán phần còn lại sau khi nghiệm thu mẫu T1\n\nSẢN PHẨM:\n✦ Đặt cọc 30% khi nhận PO\n✦ Thanh toán 70% trong 15 ngày kể từ ngày nhận hóa đơn`
                : `TOOLING:\n✦ ${quotation.payment_mold_deposit}% T/T in advance upon PO confirmation\n✦ Balance payment after T1 sample approval\n\nPRODUCTION:\n✦ 30% T/T in advance upon PO\n✦ 70% T/T within 15 days against invoice`}
            </Text>
          </View>
        </View>

        {/* SIGNATURES */}
        <View style={s.sigGrid}>
          <View style={s.sigBox}>
            <Text style={s.sigTitle}>{isVN ? 'ĐẠI DIỆN BÊN MUA' : "BUYER'S REPRESENTATIVE"}</Text>
            <Text style={s.sigNote}>{isVN ? 'Ký tên, đóng dấu' : 'Signature & stamp'}</Text>
            <Text style={s.sigName}>{project?.customer_name ?? ''}</Text>
          </View>
          <View style={s.sigBoxSeller}>
            <Text style={s.sigTitle}>{isVN ? 'ĐẠI DIỆN BÊN BÁN' : "SELLER'S REPRESENTATIVE"}</Text>
            <Text style={s.sigNote}>{isVN ? 'Ký tên' : 'Signature'}</Text>
            <Text style={s.sigName}>
              {isVN ? 'CÔNG TY CỔ PHẦN CÔNG NGHIỆP ELASTEC' : 'ELASTEC INDUSTRIAL JSC'}
            </Text>
            <Text style={s.sigSub}>+84 274 3543 574</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
