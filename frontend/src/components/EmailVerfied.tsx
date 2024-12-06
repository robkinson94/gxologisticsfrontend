import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const EmailVerified: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Extract token and uid from query parameters
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");

    // Verify token by sending it to the backend
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/verify-email/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, uid }),
          }
        );

        if (response.ok) {
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setVerificationStatus("error");
      }
    };

    if (token && uid) {
      verifyEmail();
    } else {
      setVerificationStatus("error");
    }
  }, [searchParams]);

  const handleRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        {verificationStatus === "success" ? (
          <>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Your email has been verified!
            </h2>
            <p className="text-gray-700 mb-6">
              You can now login to your account!.
            </p>
            <button
              onClick={handleRedirect}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow-md transition duration-300"
            >
              Go to Login
            </button>
          </>
        ) : verificationStatus === "error" ? (
          <>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-700 mb-6">
              The verification link is invalid or has expired.
            </p>
          </>
        ) : (
          <h2 className="text-3xl font-bold text-blue-600 mb-4">
            Verifying...
          </h2>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;
