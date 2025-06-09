const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true,
    },
    employeeCode: {
      type: String,
      required: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessModel',
      required: true,
    },
    // departmentId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'DepartmentModel',
    //   required: true,
    // },
  },
  { timestamps: true }
);
