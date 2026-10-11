import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { QuotationPDF } from '@/lib/pdf/quotation-pdf'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const quotId = searchParams.get('quotId')
  if (!quotId) return NextResponse.json({ error: 'Missing quotId' }, { status: 400 })

  const supabase = await createClient()
  const { data: quot } = await supabase
    .from('quotations')
    .select('*, items:quotation_items(*)')
    .eq('id', quotId)
    .single()

  if (!quot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: project } = await supabase.from('projects').select('*').eq('id', quot.project_id).single()
  const { data: bomItems } = await supabase
    .from('bom_items')
    .select('*, material:materials!material_id(*), machine:machines(*)')
    .eq('project_id', quot.project_id)
    .order('sort_order')

  const refNo = `${project?.code}-Rev${String(quot.revision).padStart(2, '0')}`

  const element = React.createElement(QuotationPDF, {
    quotation: quot,
    project,
    bomItems: bomItems ?? [],
  })

  const buffer = await renderToBuffer(element as any)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${refNo}.pdf"`,
    },
  })
}
