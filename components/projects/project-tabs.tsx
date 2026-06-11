'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BomEditor } from '@/components/bom/bom-editor'
import { CostingView } from '@/components/costing/costing-view'
import { QuotationManager } from '@/components/quotation/quotation-manager'
import { ProjectInfo } from './project-info'
import type { Project, BomItem, CostSettings, Machine, Material, Quotation } from '@/types/database'

interface Props {
  project: Project
  bomItems: BomItem[]
  costSettings: CostSettings
  machines: Machine[]
  materials: Material[]
  quotations: Quotation[]
  userId: string
}

export function ProjectTabs({ project, bomItems, costSettings, machines, materials, quotations, userId }: Props) {
  const [currentBomItems, setCurrentBomItems] = useState(bomItems)

  return (
    <Tabs defaultValue="bom" className="space-y-4">
      <TabsList className="bg-white border shadow-sm">
        <TabsTrigger value="info">📋 Thông tin</TabsTrigger>
        <TabsTrigger value="bom">🔧 BOM</TabsTrigger>
        <TabsTrigger value="costing">💰 Costing</TabsTrigger>
        <TabsTrigger value="quotations">📄 Báo giá</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <ProjectInfo project={project} />
      </TabsContent>

      <TabsContent value="bom">
        <BomEditor
          projectId={project.id}
          bomItems={currentBomItems}
          machines={machines}
          materials={materials}
          onUpdate={setCurrentBomItems}
        />
      </TabsContent>

      <TabsContent value="costing">
        <CostingView
          bomItems={currentBomItems}
          costSettings={costSettings}
        />
      </TabsContent>

      <TabsContent value="quotations">
        <QuotationManager
          project={project}
          bomItems={currentBomItems}
          costSettings={costSettings}
          quotations={quotations}
          userId={userId}
        />
      </TabsContent>
    </Tabs>
  )
}
