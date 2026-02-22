"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

interface GuestPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userInfo: GuestUserInfo) => void;
  isLoading: boolean;
}

export interface GuestUserInfo {
  name: string;
  gender: "male" | "female";
  age: string;
  phone: string;
  email: string;
}

export function GuestPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: GuestPaymentModalProps) {
  const [userInfo, setUserInfo] = useState<GuestUserInfo>({
    name: "",
    gender: "female",
    age: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string | null) => {
    if (value) {
      setUserInfo((prev) => ({ ...prev, gender: value as "male" | "female" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.age || !userInfo.phone || !userInfo.email) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    onSubmit(userInfo);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#f7f3f0] border border-black rounded-none shadow-none font-suit">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-normal">
            예약 정보 입력
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-black font-medium">
              이름
            </Label>
            <Input
              id="name"
              name="name"
              value={userInfo.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
              className="bg-white border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender" className="text-black font-medium">
              성별
            </Label>
            <Select value={userInfo.gender} onValueChange={handleGenderChange}>
              <SelectTrigger className="bg-white border-black rounded-none focus:ring-0 focus:border-black h-12">
                <SelectValue>
                  {userInfo.gender === "female"
                    ? "여성"
                    : userInfo.gender === "male"
                      ? "남성"
                      : "성별 선택"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-black rounded-none">
                <SelectItem
                  value="female"
                  className="rounded-none focus:bg-[#f7f3f0] focus:text-black cursor-pointer"
                >
                  여성
                </SelectItem>
                <SelectItem
                  value="male"
                  className="rounded-none focus:bg-[#f7f3f0] focus:text-black cursor-pointer"
                >
                  남성
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age" className="text-black font-medium">
              나이
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={userInfo.age}
              onChange={handleChange}
              placeholder="예: 25"
              required
              className="bg-white border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-black font-medium">
              연락처
            </Label>
            <Input
              id="phone"
              name="phone"
              value={userInfo.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              required
              className="bg-white border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-black font-medium">
              이메일
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userInfo.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              className="bg-white border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-none border-black hover:bg-gray-100 h-10 px-8"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-none bg-black text-white hover:bg-gray-800 h-10 px-8"
            >
              {isLoading ? "결제 준비중..." : "결제하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
