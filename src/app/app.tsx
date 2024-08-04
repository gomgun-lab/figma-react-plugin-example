import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [frameInfo, setFrameInfo] = useState<string | null>(null);

  useEffect(() => {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      if (message.type === "frameSelected") {
        setFrameInfo(message.data);
      } else if (message.type === "noFrameSelected") {
        setFrameInfo(null);
      }
    };
  }, []);

  return (
    <div>
      {frameInfo ? <h1>{frameInfo}</h1> : <h1>프레임을 선택해주세요</h1>}
    </div>
  );
};

export default App;
