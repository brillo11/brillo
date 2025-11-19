"use client";

import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Button } from "@repo/ui/components/button";
import { Plus, Trash2, Save } from "lucide-react";

// Import AG Grid CSS - required for the grid to display
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Define the row data interface
interface OrderRow {
  id: string;
  productCode: string;
  email: string;
  name: string;
  calendarType: "양력" | "음력";
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: "남성" | "여성";
}

// Initial empty row
const createEmptyRow = (): OrderRow => ({
  id: crypto.randomUUID(),
  productCode: "정통사주",
  email: "",
  name: "",
  calendarType: "양력",
  birthYear: 1990,
  birthMonth: 1,
  birthDay: 1,
  birthHour: 0,
  birthMinute: 0,
  gender: "남성",
});

export default function OrderEntryPage() {
  const [rowData, setRowData] = useState<OrderRow[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);

  // Column Definitions
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
          values: ["정통사주", "연애사주", "결혼사주", "직업사주", "재물사주"],
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
          values: ["양력", "음력"],
        },
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
          values: ["남성", "여성"],
        },
        width: 100,
      },
    ],
    []
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

  const handleClearData = useCallback(() => {
    if (confirm("모든 데이터를 초기화하시겠습니까?")) {
      setRowData([createEmptyRow()]);
    }
  }, []);

  const handleSave = useCallback(() => {
    console.log("Saving data:", rowData);
    alert(`총 ${rowData.length}건의 주문 데이터를 저장합니다. (콘솔 확인)`);
  }, [rowData]);

  return (
    <div className="flex flex-col h-screen bg-[#fbf4ec] p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">주문 대량 등록</h1>
            <p className="text-stone-600 text-sm mt-1">
              엑셀처럼 데이터를 입력하여 주문을 일괄 등록할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleClearData}
              className="flex items-center space-x-1.5 border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>초기화</span>
            </Button>
            <Button
              onClick={handleSave}
              className="flex items-center space-x-1.5 bg-stone-800 text-white hover:bg-stone-700"
            >
              <Save className="w-4 h-4" />
              <span>저장하기</span>
            </Button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="flex-1 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div
            className="ag-theme-quartz"
            style={{ width: "100%", height: "100%" }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection
              animateRows
              rowHeight={40}
              headerHeight={45}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center py-2">
          <div className="text-sm text-stone-500">총 {rowData.length}행</div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            className="flex items-center space-x-1 bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
          >
            <Plus className="w-4 h-4" />
            <span>행 추가</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
