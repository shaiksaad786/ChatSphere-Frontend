import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../validations/authSchema";
import { Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../../utils/auth";
function RegisterForm(){
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors},} = useForm({
        resolver: zodResolver(registerSchema),
    });
    const onSubmit = async (data) => {
  try {

    const response = await registerUser({
      name: data.fullName,
      email: data.email,
      password: data.password,
    });

    saveToken(response.token);

    alert(response.message);

    navigate("/dashboard");

  } catch (error) {
    alert(error.response?.data?.message || "Registration Failed");
  }
};
    return (
        <div className="w-full max-w-md bg-white-100 p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center text-indigo-600">
                ChatSphere
            </h1>
            <p className="text-center text-gray-500 mt-2">
                Create Account
            </p>
            <form onSubmit = {handleSubmit(onSubmit)} className="mt-8">
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        Full Name : 
                    </label>
                    <input 
                    type="text" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register("fullName")}
                    placeholder="Enter Your Name" 
                    />
                    <p className="text-red-500 text-sm mb-3">
                        {errors.fullName?.message}
                    </p>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        Email : 
                    </label>
                    <input 
                    type="email"
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Enter Your Email"
                    {...register("email")}
                    />
                    <p className="text-red-500 text-sm mb-3">
                        {errors.email?.message}
                    </p>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        Password : 
                    </label>
                    <input 
                    type="password" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Create Password"
                     {...register("password")}
                    />
                     <p className="text-red-500 text-sm mb-3">
                        {errors.password?.message}
                    </p>
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-medium">
                        Confirm Password : 
                    </label>
                    <input 
                    type="password" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Confirm Password"
                    {...register("confirmPassword")}
                    />
                    <p className="text-red-500 text-sm mb-5">
                        {errors.confirmPassword?.message}
                    </p>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
                    Register
                </button>
            </form>
            <p className="text-center mt-6">
                Already Have an account?
                <Link to="/login" className = "text-indigo-600 ml-2 font-semibold">
                Login
                </Link>
            </p>
        </div>
    );
}
export default RegisterForm;