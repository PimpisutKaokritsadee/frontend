import React, { useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";
// import { useActivityStore } from "../../../stores/Admin/activity_store"; // ✅ นำเข้า Zustand Store
import { useAssessmentStore } from "../../../../stores/Admin/assessment_store";
import Button from "../../../../components/Button";
import Loading from "../../../../components/Loading";
import { Activity } from "../../../../stores/Admin/activity_store";
import { useNavigate } from "react-router-dom";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { toast } from "sonner";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextField, IconButton, Paper, Box, Typography } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material"; // ✅ นำเข้า SelectChangeEvent
import { useActivityStore } from "../../../../stores/Admin/store_create_activity";
import type { FormData } from "../../../../types/Admin/type_create_activity_admin";

import {
  handleChange,
  handleDateTimeChange,
  handleFileChange,
  validateForm,
  convertToDate,
} from "../create-activity/utils/form_utils"; // หรือเปลี่ยน path ให้ตรงกับตำแหน่งจริง
import { handleDateTimeChange as handleDateTimeChangeBase } from "../create-activity/utils/form_utils";
import { handleChange as baseHandleChange } from "../create-activity/utils/form_utils";
import { handleChange as formHandleChange } from "../create-activity/utils/form_utils";
import ActivityInfoSection from "../create-activity/components/ActivityInfoSection";
import RegisterPeriodSection from "../create-activity/components/RegisterPeriodSection";
import ActivityTimeSection from "../create-activity/components/ActivityTimeSection";
import TypeAndLocationSection from "../create-activity/components/TypeAndLocationSection";
import RoomSelectionSection from "../create-activity/components/RoomSelectionSection";
import FoodMenuSection from "../create-activity/components/FoodMenuSection";
import AssessmentSection from "../create-activity/components/AssessmentSection";
import ImageUploadSection from "../create-activity/components/ImageUploadSection";
import ActionButtonsSection from "../create-activity/components/ActionButtonsSection";
import DescriptionSection from "../create-activity/components/DescriptionSection";
import StatusAndSeatSection from "../create-activity/components/StatusAndSeatSection";


const CreateActivityAdmin: React.FC = () => {
  const { createActivity, activityLoading } = useActivityStore(); //
  const [formData, setFormData] = useState<FormData>({
    ac_id: null,
    ac_name: "",
    assessment_id: null,
    ac_company_lecturer: "",
    ac_description: "",
    ac_type: "",
    ac_room: "",
    ac_seat: null,
    ac_food: [],
    ac_status: "Private",
    ac_location_type: "Onsite",
    ac_state: "",
    ac_start_register: "",
    ac_end_register: "",
    ac_create_date: "",
    ac_last_update: "",
    ac_registered_count: 0,
    ac_attended_count: 0,
    ac_not_attended_count: 0,
    ac_start_time: "",
    ac_end_time: "",
    ac_image_url: null,
    ac_normal_register: "",
    ac_start_assessment: "",
    ac_end_assessment: "",
  });

  const IfBuildingRoom: Record<string, { name: string; capacity: number }[]> = {
    "3": [
      { name: "IF-3M210", capacity: 210 }, // ห้องบรรยาย
      { name: "IF-3C01", capacity: 55 }, // ห้องปฏิบัติการ
      { name: "IF-3C02", capacity: 55 },
      { name: "IF-3C03", capacity: 55 },
      { name: "IF-3C04", capacity: 55 },
    ],
    "4": [
      { name: "IF-4M210", capacity: 210 }, // ห้องบรรยาย
      { name: "IF-4C01", capacity: 55 }, // ห้องปฏิบัติการ
      { name: "IF-4C02", capacity: 55 },
      { name: "IF-4C03", capacity: 55 },
      { name: "IF-4C04", capacity: 55 },
    ],
    "5": [
      { name: "IF-5M210", capacity: 210 }, // ห้องบรรยาย
    ],
    "11": [
      { name: "IF-11M280", capacity: 280 }, // ห้องบรรยาย
    ],
  };

  const navigate = useNavigate();
  const { assessments, fetchAssessments } = useAssessmentStore();

  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [seatCapacity, setSeatCapacity] = useState<number | string>(""); // ✅ เก็บจำนวนที่นั่งของห้องที่เลือก

  const [value, setValue] = React.useState<Dayjs | null>(
    dayjs("2022-04-17T15:30")
  );

  const handleFloorChange = (event: SelectChangeEvent) => {
    setSelectedFloor(event.target.value);
    setSelectedRoom(""); // ✅ รีเซ็ตห้องเมื่อเปลี่ยนชั้น
    setSeatCapacity(""); // ✅ รีเซ็ตที่นั่งเมื่อเปลี่ยนชั้น
  };

  const handleRoomChange = (event: SelectChangeEvent) => {
    setSelectedRoom(event.target.value);

    // ✅ ค้นหา `capacity` ของห้องที่เลือก
    const selectedRoomObj = IfBuildingRoom[selectedFloor]?.find(
      (room) => room.name === event.target.value
    );

    const newSeatCapacity = selectedRoomObj ? selectedRoomObj.capacity : "";

    setSeatCapacity(newSeatCapacity); // ✅ อัปเดตจำนวนที่นั่ง

    setFormData((prev) => ({
      ...prev,
      ac_room: event.target.value, // ✅ บันทึกห้องที่เลือก
      ac_seat: newSeatCapacity, // ✅ บันทึกจำนวนที่นั่ง
    }));
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);


  const uploadImageToCloudinary = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Please upload an image.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ceth-project"); // ✅ ตรวจสอบค่าตรงนี้

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dn5vhwoue/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const data = await response.json();
    console.log("Upload image success!", data.secure_url);
    return data.secure_url;
  };

  // const convertToDate = (value: string | null | undefined) =>
  //   value && value.trim() !== "" ? new Date(value) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, setErrors)) {
      toast.error("กรุณากรอกข้อมูลให้ถูกต้องก่อนส่งฟอร์ม!");
      return;
    }


    let imageUrl = "";
    if (formData.ac_image_url instanceof File) {
      imageUrl = await uploadImageToCloudinary(formData.ac_image_url);
    }

    let acRecieveHours = formData.ac_recieve_hours
      ? Number(formData.ac_recieve_hours)
      : 0;

    if (
      formData.ac_location_type !== "Course" &&
      formData.ac_start_time &&
      formData.ac_end_time
    ) {
      const start = dayjs(formData.ac_start_time);
      const end = dayjs(formData.ac_end_time);
      const duration = end.diff(start, "hour", true); // ✅ คำนวณเป็นชั่วโมง (รวมเศษทศนิยม)
      acRecieveHours = duration > 0 ? duration : 0; // ✅ ป้องกันค่าติดลบ
    }

    let startRegister = dayjs(formData.ac_start_register);
    if (formData.ac_status == "Public") {
      startRegister = dayjs(new Date());
    }

    const activityData: Activity = {
      ...formData,
      ac_create_date: new Date(),
      ac_last_update: new Date(),
      ac_start_register: startRegister,
      ac_recieve_hours: acRecieveHours,
      ac_state: "Not Start",
      ac_seat: parseInt(seatCapacity) ,
      ac_image_url: imageUrl, // ✅ ใช้ URL ของรูปภาพจาก Cloudinary
      ac_normal_register: convertToDate(formData.ac_normal_register),
      ac_end_register: convertToDate(formData.ac_end_register),
      ac_start_assessment: convertToDate(formData.ac_start_assessment),
      ac_end_assessment: convertToDate(formData.ac_end_assessment),
      assessment_id: formData.assessment_id
        ? Number(formData.assessment_id)
        : null,
      ac_food: [...(formData.ac_food || null)],
    };

    console.log("🚀 Data ที่ส่งไป store:", activityData);

    try {
      await createActivity(activityData);
      navigate("/list-activity-admin");
    } catch (error) {
      console.error("❌ Error creating activity:", error);
      toast.error("Create failed!");
    }
  };

  const addFoodOption = () => {
    setFormData((prev) => ({
      ...prev,
      ac_food: [
        ...(prev.ac_food ?? []),
        `เมนู ${prev.ac_food?.length ?? 0 + 1}`,
      ],
    }));
  };

  // ฟังก์ชันแก้ไขเมนูอาหาร
  const updateFoodOption = (index: number, newValue: string) => {
    const updatedFoodOptions = [...(formData.ac_food ?? [])];
    updatedFoodOptions[index] = newValue;
    setFormData((prev) => ({ ...prev, ac_food: updatedFoodOptions }));
  };

  // ฟังก์ชันลบเมนูอาหาร
  const removeFoodOption = (index: number) => {
    const updatedFoodOptions = formData.ac_food?.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ac_food: updatedFoodOptions }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์ขนาดใหญ่เกินไป (ต้องไม่เกิน 5MB)");
        return;
      }

      // ✅ แสดงตัวอย่างรูปภาพ
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // ✅ เก็บไฟล์ไว้ใน `ac_image_url`
      setFormData((prev) => ({
        ...prev,
        ac_image_url: file, // ✅ ตอนนี้เก็บเป็น File
      }));
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("Fetching assessments..."); // ✅ ตรวจสอบว่า useEffect ทำงาน
    fetchAssessments();
  }, []);

  useEffect(() => {
    console.log("Assessments:", assessments); // ✅ ตรวจสอบว่า assessments มีค่าหรือไม่
  }, [assessments]);


  const [errors, setErrors] = useState<Record<string, string>>({});


  const handleFormChange = (e: React.ChangeEvent<any> | SelectChangeEvent) => {
    formHandleChange(e, setFormData);
  };



  // ✅ Wrapper ที่ fix setFormData
  const handleDateTimeChange = (name: string, newValue: Dayjs | null) => {
    handleDateTimeChangeBase(name, newValue, setFormData);
  };

  return (
    <>
      {activityLoading ? (
        <Loading />
      ) : (
        <Box className="justify-items-center">
          <div
            className={`w-320 mx-auto ml-2xl mt-5 mb-5 p-6 border bg-white border-gray-200 rounded-lg shadow-sm min-h-screen flex flex-col`}
          >
            <h1 className="text-4xl font-bold mb-11">สร้างกิจกรรมสหกิจ</h1>
            <form onSubmit={handleSubmit} className="space-y-10 flex-grow">
              <div>

                {/* แถวแรก: ชื่อกิจกรรม + วันเวลาปิด/เปิดลงทะเบียน */}
                <div className="flex space-x-6  ">
                  <ActivityInfoSection
                    formData={formData}
                    handleChange={handleFormChange} // ✅ รับได้ 1 argument ตาม type ที่ต้องการ
                  />
                  <RegisterPeriodSection
                    formData={formData}
                    handleDateTimeChange={handleDateTimeChange}
                  />

                </div>

                {/* แถวสอง: คำอธิบาย + วันเวลาการดำเนินกิจกรรม + จำนวนชั่วโมง */}
                <div className="flex space-x-6 ">

                  <DescriptionSection
                    formData={formData}
                    handleChange={handleFormChange}
                  />

                  <ActivityTimeSection
                    formData={formData}
                    setFormData={setFormData}
                    handleDateTimeChange={handleDateTimeChange}
                  />
                </div>




                <TypeAndLocationSection
                  formData={formData}
                  handleChange={(e) => handleChange(e, setFormData)}
                  setSelectedFloor={setSelectedFloor}
                  setSelectedRoom={setSelectedRoom}
                  setSeatCapacity={setSeatCapacity}
                />

                <RoomSelectionSection
                  formData={formData}
                  selectedFloor={selectedFloor}
                  selectedRoom={selectedRoom}
                  IfBuildingRoom={IfBuildingRoom}
                  handleFloorChange={handleFloorChange}
                  handleRoomChange={handleRoomChange}
                />

                <StatusAndSeatSection
                  formData={formData}
                  seatCapacity={seatCapacity}
                  handleChange={handleFormChange}
                  setSeatCapacity={setSeatCapacity}
                  selectedRoom={selectedRoom}
                />

                <FoodMenuSection
                  formData={formData}
                  addFoodOption={addFoodOption}
                  removeFoodOption={removeFoodOption}
                  updateFoodOption={updateFoodOption}
                />

                <AssessmentSection
                  formData={formData}
                  assessments={assessments}
                  handleChange={handleFormChange}
                  handleDateTimeChange={handleDateTimeChange}
                />

                <ImageUploadSection
                  previewImage={previewImage}
                  handleFileChange={handleFileChange}
                />

                <ActionButtonsSection
                  formStatus={formData.ac_status}
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                />

              </div>
            </form>


          </div>
        </Box>
      )}
    </>
  );
};

export default CreateActivityAdmin;
