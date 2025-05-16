// components/AdminActivityForm/TypeAndLocationSection.tsx
import { MenuItem, Select } from "@mui/material";
import { SelectChangeEvent } from "@mui/material";

interface Props {
  formData: any;
  handleChange: (e: React.ChangeEvent<any> | SelectChangeEvent) => void;
  handleChangeSelect: (e: SelectChangeEvent) => void;
}

const TypeAndLocationSection: React.FC<Props> = ({ formData, handleChange, handleChangeSelect }) => {
  return (
    <div className="flex space-x-6 items-center mt-6">
      {/* ประเภทกิจกรรม */}
      <div>
        <label className="block font-semibold w-50">ประเภท *</label>
        <Select
          labelId="ac_type-label"
          name="ac_type"
          value={formData.ac_type}
          onChange={handleChange}
          className="rounded w-140"
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <span className="text-black">เลือกประเภทกิจกรรม</span>;
            }
            return selected;
          }}
          sx={{
            height: "56px",
            "& .MuiSelect-select": {
              padding: "8px",
            },
          }}
        >
          <MenuItem disabled value="">
            เลือกประเภทกิจกรรม
          </MenuItem>
          <MenuItem value="Soft Skill">ชั่วโมงเตรียมความพร้อม (Soft Skill)</MenuItem>
          <MenuItem value="Hard Skill">ชั่วโมงทักษะทางวิชาการ (Hard Skill)</MenuItem>
        </Select>
      </div>

      {/* ประเภทสถานที่ */}
      <div>
        <label className="block font-semibold w-50">ประเภทสถานที่จัดกิจกรรม *</label>
        <Select
          labelId="ac_location_type-label"
          name="ac_location_type"
          value={formData.ac_location_type}
          onChange={handleChangeSelect}
          className="rounded w-76"
          sx={{
            height: "56px",
            "& .MuiSelect-select": { padding: "8px" },
          }}
        >
          <MenuItem value="Online">Online</MenuItem>
          <MenuItem value="Onsite">Onsite</MenuItem>
          <MenuItem value="Course">Course</MenuItem>
        </Select>
      </div>
    </div>
  );
};

export default TypeAndLocationSection;
