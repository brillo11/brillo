"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Plus, Trash2, Save } from "lucide-react";
import { getProductsForList } from "@/serverActions/product.actions";
import { createBulkPointOrders } from "@/serverActions/pointOrder.actions";
import { toast } from "sonner";

// Import AG Grid CSS - only the theme CSS, not the base CSS (to avoid conflict with Theming API)
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Define the row data interface
interface OrderRow {
  id: string;
  productCode: string;
  email: string;
  name: string;
  calendarType: "SOLAR" | "LUNAR";
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: "MALE" | "FEMALE";
}

// Initial empty row
const createEmptyRow = (): OrderRow => ({
  id: crypto.randomUUID(),
  productCode: "인생사주",
  email: "",
  name: "",
  calendarType: "SOLAR",
  birthYear: 1990,
  birthMonth: 1,
  birthDay: 1,
  birthHour: 0,
  birthMinute: 0,
  gender: "FEMALE",
});

export default function OrderEntryPage() {
  const gridRef = useRef<AgGridReactType<OrderRow>>(null);
  const [rowData, setRowData] = useState<OrderRow[]>([createEmptyRow()]);
  const [productNames, setProductNames] = useState<string[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Fetch product names on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProductsForList();
        const names = products.map(p => p.title);
        setProductNames(names);
        
        // If no products, set a default
        if (names.length === 0) {
          setProductNames(["인생사주"]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        // Fallback to default products
        setProductNames(["인생사주", "정통사주", "연애사주"]);
      }
    };
    
    fetchProducts();
  }, []);

  // Column Definitions - depends on productNames
  const columnDefs = useMemo<ColDef<OrderRow>[]>(
    () => [
      {
        headerName: "순번",
        valueGetter: "node.rowIndex + 1",
        width: 70,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        editable: false,
      },
      {
        field: "productCode",
        headerName: "상품코드",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: productNames.length > 0 ? productNames : ["인생사주"],
        },
        width: 150,
      },
      {
        field: "email",
        headerName: "이메일",
        editable: true,
        width: 250,
      },
      {
        field: "name",
        headerName: "이름",
        editable: true,
        width: 120,
      },
      {
        field: "calendarType",
        headerName: "양/음력",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["SOLAR", "LUNAR"],
        },
        valueFormatter: (params) => (params.value === "SOLAR" ? "양력" : "음력"),
        width: 100,
      },
      {
        field: "birthYear",
        headerName: "생년",
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 1900,
          max: 2100,
        },
        width: 90,
      },
      {
        field: "birthMonth",
        headerName: "생월",
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 1,
          max: 12,
        },
        width: 80,
      },
      {
        field: "birthDay",
        headerName: "생일",
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 1,
          max: 31,
        },
        width: 80,
      },
      {
        field: "birthHour",
        headerName: "생시",
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 23,
        },
        width: 80,
      },
      {
        field: "birthMinute",
        headerName: "생분",
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 59,
        },
        width: 80,
      },
      {
        field: "gender",
        headerName: "성별",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["MALE", "FEMALE"],
        },
        valueFormatter: (params) => (params.value === "MALE" ? "남성" : "여성"),
        width: 100,
      },
    ],
    [productNames]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  const handleAddRow = useCallback(() => {
    setRowData((prev) => [...prev, createEmptyRow()]);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    if (!selectedNodes || selectedNodes.length === 0) {
      alert("삭제할 행을 선택해주세요.");
      return;
    }

    const selectedIds = new Set(selectedNodes.map(node => node.data?.id));
    setRowData((prev) => prev.filter(row => !selectedIds.has(row.id)));
  }, []);

  const handleRegisterAll = useCallback(() => {
    if (rowData.length === 0) {
      toast.error("등록할 데이터가 없습니다.");
      return;
    }
    setConfirmModalOpen(true);
  }, [rowData]);

  const handleConfirmRegister = useCallback(async () => {
    setConfirmModalOpen(false);

    // Map Korean calendar/gender back to English for API (valueFormatter handles display)
    const ordersToSubmit = rowData.map(row => ({
      productCode: row.productCode,
      email: row.email,
      name: row.name,
      calendar: row.calendarType,
      birthYear: row.birthYear,
      birthMonth: row.birthMonth,
      birthDay: row.birthDay,
      birthHour: row.birthHour,
      birthMinute: row.birthMinute,
      gender: row.gender,
    }));

    try {
      const result = await createBulkPointOrders(ordersToSubmit);
      
      if (result.success) {
        toast.success(`총 ${result.count}건의 주문이 등록되었습니다.`);
        // Clear the grid after successful registration
        setRowData([createEmptyRow()]);
      } else {
        toast.error(result.error || "주문 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("주문 등록 중 오류가 발생했습니다.");
    }
  }, [rowData]);

  return (
    <div className="flex flex-col bg-[#fbf4ec] min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">주문 등록</h1>
            <p className="text-stone-600 text-sm mt-1">
              엑셀처럼 데이터를 입력하여 주문을 일괄 등록할 수 있습니다.
            </p>
            <p className="text-stone-600 text-sm mt-1 font-bold">*셀 선택 - 엔터 - 입력 - 엔터</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="flex items-center space-x-1 bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              <Plus className="w-4 h-4" />
              <span>행 추가</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>선택삭제</span>
            </Button>
            <Button
              onClick={handleRegisterAll}
              className="flex items-center space-x-1.5 bg-stone-800 text-white hover:bg-stone-700"
            >
              <Save className="w-4 h-4" />
              <span>전체등록</span>
            </Button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="ag-theme-quartz" style={{ width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection
              animateRows
              rowHeight={40}
              headerHeight={45}
              domLayout="autoHeight"
            />
          </div>
        </div>

        {/* Footer Info */}
        {rowData.length > 0 && (
          <div className="text-sm text-stone-500">총 {rowData.length}행</div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-stone-900">주문 등록 확인</DialogTitle>
            <DialogDescription className="text-stone-600">
              총 {rowData.length}건의 주문을 등록하시겠습니까?
              <br />
              <span className="text-sm text-stone-500 mt-2 block">
                등록 후에는 주문 목록에서 확인할 수 있습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              className="border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirmRegister}
              className="bg-stone-800 text-white hover:bg-stone-700"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
