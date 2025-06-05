const members = [
  { studentID: "22520089 ", name: "Phùng Việt Bắc" },
  { studentID: "22520067 ", name: "Phạm Đức Anh" },
  { studentID: "22521215 ", name: "Nguyễn Văn Quốc" },
  { studentID: "23520394 ", name: "Trịnh Nhật Duy" },
  { studentID: "23521729 ", name: "Trần Anh Tuấn" },
];

export default function Members() {
  return (
    <div className="relative isolate overflow-hidden bg-transparent py-24 sm:py-32">
      <img
        alt=""
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-y=.8&w=2830&h=1500&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
        className="absolute inset-0 -z-10 size-full object-cover object-right md:object-center"
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            Nhóm phát triển
          </h2>
          <p className="mt-8 text-lg font-medium text-gray-300 sm:text-xl/8">
            Hệ thống đề xuất lộ trình du lịch thông minh dựa trên AI. Explavue
            giúp bạn tiết kiệm thời gian và công sức trong việc lên kế hoạch cho
            chuyến đi.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
          <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-5">
            {members.map((member) => (
              <div
                key={member.studentID}
                className="flex flex-col-reverse gap-1"
              >
                <dt className="text-base/7 text-gray-300">{member.name}</dt>
                <dd className="text-4xl font-semibold text-white">
                  {member.studentID}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
