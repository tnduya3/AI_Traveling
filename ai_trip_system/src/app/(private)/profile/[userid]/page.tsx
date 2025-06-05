"use client";
import {
  FaChevronLeft,
  FaPen,
  FaXmark,
  FaCamera,
  FaUserCheck,
  FaUserXmark,
  FaUserPlus,
} from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import useSWR, { mutate } from "swr";
import { ToastContainer, Slide, toast } from "react-toastify";
import { getCookie } from "cookies-next";
import { use } from "react";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ userid: string }>;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [userEdit, setUserEdit] = useState<UserBase>();
  const [step, setStep] = useState(1);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const avatarFileRef = useRef<File | null>(null);
  const router = useRouter();

  const { userid: userID } = use(params);
  const accessToken = getCookie("token");
  const currentUserID = localStorage.getItem("current_user_id");

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
      return;
    }
  }, []);

  const fetcher = (url: string) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR<UserResponse>(
    `https://aitripsystem-api.onrender.com/api/v1/users/idUser?lookup=${userID}`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  const {
    data: friendsData,
    error: friendsError,
    isLoading: friendsLoading,
  } = useSWR<UserResponse[]>(
    `https://aitripsystem-api.onrender.com/api/v1/users/${userID}/friends`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 3000,
    }
  );

  const {
    data: friendRequestData,
    error: friendRequestError,
    isLoading: friendRequestLoading,
  } = useSWR<UserResponse[]>(
    `https://aitripsystem-api.onrender.com/api/v1/users/${userID}/friend_requests_to`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (friendRequestData && Array.isArray(friendRequestData)) {
      const requestExists = friendRequestData.some(
        (request) => request.iduser === currentUserID
      );
      setIsFriendRequestSent(requestExists);
    }
  }, [friendRequestData, currentUserID]);

  useEffect(() => {
    if (friendsData && Array.isArray(friendsData)) {
      const requestExists = friendsData.some(
        (request) => request.iduser === currentUserID
      );
      setIsFriend(requestExists);
    }
  }, [friendsData, currentUserID]);

  if (userError)
    return <div>Failed to load user data: {userError.message}</div>;
  if (userLoading) return <div>Loading...</div>;
  if (friendsError) return console.log(friendsError.message);
  if (friendsLoading) return console.log("Loading friend list...");
  if (friendRequestError) return console.log(friendsError.message);
  if (friendRequestLoading)
    return console.log("Loading friend request to list...");

  const friendsCount = friendsData?.length ?? 0;

  const genderOptions = [
    { label: "Nam", value: 0 },
    { label: "Nữ", value: 1 },
    { label: "Khác", value: 2 },
  ];

  const renderGender = () => {
    const gender = genderOptions.find(
      (option) => option.value === userData?.gender
    );
    return <span>{gender ? gender.label : "Other"}</span>;
  };

  const handleBtnBack = () => {
    router.push("/home");
  };

  const openEditModal = () => {
    if (userData) {
      setUserEdit({ ...userData });
    }

    setPreviewAvatar(null);
    avatarFileRef.current = null;
    setStep(1);
    setShowEditModal(true);
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Check valid image
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    avatarFileRef.current = file;
    const previewUrl = URL.createObjectURL(file);
    setPreviewAvatar(previewUrl);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserEdit((prev) => ({
      ...prev!,
      name: value,
    }));
  };

  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setUserEdit((prev) => ({
      ...prev!,
      gender: value,
    }));
  };

  const handlePhonenumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\+?\d*$/.test(value)) {
      setUserEdit((prev) => ({
        ...prev!,
        phonenumber: value,
      }));
    }
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserEdit((prev) => ({
      ...prev!,
      description: value,
    }));
  };

  const handleSaveBtn = async () => {
    setIsSaving(true);
    try {
      // Cập nhật avatar nếu có
      const fileUpdate = avatarFileRef.current;
      if (fileUpdate) {
        const formData = new FormData();
        formData.append("file", fileUpdate);

        const avatarRes = await fetch(
          `https://aitripsystem-api.onrender.com/api/v1/users/${userID}/avatar`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (!avatarRes.ok) throw new Error("Failed to upload avatar");
      }

      // Cập nhật thông tin khác
      const payload = {
        name: userEdit?.name,
        gender: userEdit?.gender,
        phonenumber: userEdit?.phonenumber,
        description: userEdit?.description,
      };

      const infoRes = await fetch(
        `https://aitripsystem-api.onrender.com/api/v1/users/${userID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!infoRes.ok) throw new Error("Failed to update user info.");
      toast.success("Cập nhật dữ liệu thành công");

      await mutate(
        `https://aitripsystem-api.onrender.com/api/v1/users/idUser?lookup=${userID}`
      );
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    } finally {
      setIsSaving(false);
      setShowEditModal(false);
      setStep(1);
    }
  };

  const handleFriendRequestSent = async () => {
    setIsSending(true);
    try {
      if (isFriendRequestSent || isFriend) {
        const cancelRes = await fetch(
          `https://aitripsystem-api.onrender.com/api/v1/friends?id_self=${encodeURIComponent(
            currentUserID ?? ""
          )}&id_friend=${encodeURIComponent(userID ?? "")}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!cancelRes.ok) throw new Error("Failed to cancel friend request.");
        setIsFriend(false);
        setIsFriendRequestSent(false);
        await mutate(
          `https://aitripsystem-api.onrender.com/api/v1/users/${userID}/friend_requests_to`
        );
      } else {
        const payload = {
          idself: currentUserID,
          idfriend: userID,
        };

        const addFriendRes = await fetch(
          `https://aitripsystem-api.onrender.com/api/v1/friends/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!addFriendRes.ok) throw new Error("Failed to send friend request.");
        setIsFriendRequestSent(false);
        await mutate(
          `https://aitripsystem-api.onrender.com/api/v1/users/${userID}/friend_requests_to`
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông tin kết bạn:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col">
      <main className="flex-grow w-full mx-auto px-4 md:px-16 pt-8 pb-16 dark:bg-gradient-to-b from-black via-gray-800 to-blue-950 dark:border-b-2 border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleBtnBack}
            className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
          >
            <FaChevronLeft />
          </button>
          <h1 className="text-2xl font-bold text-black dark:text-white"></h1>
        </div>
        <div className="flex-grow flex-col bg-white rounded-lg p-6 mx-auto shadow-sm dark:bg-transparent text-black dark:text-white dark:border-2 border-gray-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <Image
              src={
                userData?.avatar
                  ? `https://aitripsystem-api.onrender.com/api/v1/proxy_image/?url=${encodeURIComponent(
                      userData.avatar
                    )}`
                  : "profile.svg"
              }
              priority={true}
              width={200}
              height={200}
              alt="avatar"
              className="border-2 dark:text-white border-black rounded-full object-cover"
              style={{ width: "200px", height: "200px" }}
            />
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">{userData?.name}</h2>
              <p>{userData?.email}</p>
              <p>
                <span>{friendsCount}</span> người bạn
              </p>
            </div>
            <div className="flex gap-2 sm:ml-auto justify-center">
              {currentUserID == userID && (
                <button
                  onClick={openEditModal}
                  className="flex items-center justify-center py-3 px-4 font-bold rounded-lg text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 cursor-pointer transition-colors duration-200"
                >
                  <FaPen className="mr-2" /> Sửa hồ sơ
                </button>
              )}
              {currentUserID !== userID && (
                <button
                  onClick={handleFriendRequestSent}
                  disabled={isSending}
                  className="flex items-center justify-center w-32 h-12 font-bold rounded-lg text-md text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 cursor-pointer transition-colors duration-200"
                >
                  {isFriend ? (
                    <>
                      <FaUserCheck className="mr-2" />
                      Bạn bè
                    </>
                  ) : isFriendRequestSent ? (
                    <>
                      <FaUserXmark className="mr-2" /> Hủy lời mời
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" />
                      Thêm bạn
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex-grow mt-8">
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              <li className="py-3 sm:py-4">
                <div className="text-justify">
                  <div className="font-bold text-lg">Về bản thân:</div>
                  {userData?.description}
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div>
                  <span className="font-bold text-lg">Liên hệ:</span>{" "}
                  {userData?.phonenumber}
                </div>
              </li>
              <li className="py-3 sm:py-4">
                <div>
                  <span className="font-bold text-lg">Giới tính:</span>{" "}
                  {renderGender()}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div
          className="flex fixed inset-0 z-50 items-center justify-center bg-black/50"
          draggable="false"
        >
          <div className="flex flex-col bg-white dark:bg-black rounded-lg shadow-lg w-full h-108 md:h-100 max-w-2xl mx-4">
            {/* {Avatar update modal} */}
            {step === 1 && (
              <>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Chọn ảnh đại diện
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-xl p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaXmark />
                  </button>
                </div>

                <div className="relative p-4 text-gray-700 dark:text-white mx-auto">
                  <Image
                    src={
                      previewAvatar
                        ? previewAvatar
                        : userData?.avatar
                        ? `https://aitripsystem-api.onrender.com/api/v1/proxy_image/?url=${encodeURIComponent(
                            userData.avatar
                          )}`
                        : "profile.svg"
                    }
                    width={200}
                    height={200}
                    alt="avatar"
                    className="border-2 border-black dark:border-gray-400 rounded-full object-cover"
                    style={{ width: "200px", height: "200px" }}
                  />

                  <label
                    htmlFor="avatarUpload"
                    className="absolute bottom-0 right-0 text-xl m-4 p-3 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaCamera />
                  </label>

                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex p-4 mt-auto">
                  <button
                    onClick={() => setStep((prev) => prev + 1)}
                    className="w-full h-12 text-md font-bold rounded-4xl cursor-pointer text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-black dark:border-gray-600 transition-colors duration-200"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {/* {Name update modal} */}
            {step === 2 && (
              <>
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setStep((prev) => prev - 1)}
                    className="p-2 mr-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaChevronLeft />
                  </button>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Cập nhật tên hiển thị
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-xl p-2 ml-auto rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaXmark />
                  </button>
                </div>

                <div className="p-4 text-gray-700 dark:text-white">
                  <input
                    type="text"
                    value={userEdit?.name ?? ""}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handleNameChange}
                    placeholder="Tên của bạn"
                  />
                </div>

                <div className="flex p-4 mt-auto">
                  <button
                    onClick={() => setStep((prev) => prev + 1)}
                    className="w-full h-12 text-md font-bold rounded-4xl cursor-pointer text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-black dark:border-gray-600 transition-colors duration-200"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {/* {Gender update modal} */}
            {step === 3 && (
              <>
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setStep((prev) => prev - 1)}
                    className="p-2 mr-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaChevronLeft />
                  </button>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Chọn giới tính
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-xl p-2 ml-auto rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaXmark />
                  </button>
                </div>

                <div className="p-4 text-gray-700 dark:text-white">
                  <select
                    value={userEdit?.gender ?? 2}
                    onChange={handleGenderChange}
                    className="w-full px-3 py-3 rounded-lg border-2 text-md text-black bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-black dark:border-gray-600 dark:text-white"
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex p-4 mt-auto">
                  <button
                    onClick={() => setStep((prev) => prev + 1)}
                    className="w-full h-12 text-md font-bold rounded-4xl cursor-pointer text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-black dark:border-gray-600 transition-colors duration-200"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {/* {Phone number update modal} */}
            {step === 4 && (
              <>
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setStep((prev) => prev - 1)}
                    className="p-2 mr-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaChevronLeft />
                  </button>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Thông tin liên hệ
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-xl p-2 ml-auto rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaXmark />
                  </button>
                </div>

                <div className="p-4 text-gray-700 dark:text-white">
                  <input
                    type="tel"
                    value={userEdit?.phonenumber ?? ""}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={handlePhonenumberChange}
                    placeholder="Số điện thoại"
                  />
                </div>

                <div className="flex p-4 mt-auto">
                  <button
                    onClick={() => setStep((prev) => prev + 1)}
                    className="w-full h-12 text-md font-bold rounded-4xl cursor-pointer text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-black dark:border-gray-600 transition-colors duration-200"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {/* {Description update modal} */}
            {step === 5 && (
              <>
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setStep((prev) => prev - 1)}
                    className="p-2 mr-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaChevronLeft />
                  </button>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Giới thiệu bản thân
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setStep(1);
                    }}
                    className="text-xl p-2 ml-auto rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaXmark />
                  </button>
                </div>

                <div className="p-4 text-gray-700 dark:text-white">
                  <textarea
                    rows={6}
                    placeholder="Viết mô tả tại đây..."
                    value={userEdit?.description ?? ""}
                    onChange={handleDescriptionChange}
                    className="resize-none w-full p-2.5 text-sm rounded-lg border text-gray-900 bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>

                <div className="flex p-4 mt-auto">
                  <button
                    onClick={() => setStep((prev) => prev + 1)}
                    className="w-full h-12 text-md font-bold rounded-4xl cursor-pointer text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-black dark:border-gray-600 transition-colors duration-200"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {/* {Save update modal} */}
            {step === 6 && (
              <>
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setStep((prev) => prev - 1)}
                    className="p-2 mr-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaChevronLeft />
                  </button>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Lưu thay đổi
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setStep(1);
                    }}
                    className="text-xl p-2 ml-auto rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <FaXmark />
                  </button>
                </div>

                <div className="flex p-4 m-auto">
                  <button
                    onClick={handleSaveBtn}
                    disabled={isSaving}
                    className={`w-72 md:w-84 h-12 text-md font-bold rounded-4xl cursor-pointer text-white bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-black dark:border-gray-600 transition-colors duration-200 ${
                      isSaving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSaving ? "Lưu thay đổi..." : "Xác nhận"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        aria-label="Notifications"
      />
    </div>
  );
}
