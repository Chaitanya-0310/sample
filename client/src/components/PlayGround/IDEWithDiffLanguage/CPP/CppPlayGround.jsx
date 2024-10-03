import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import CppLanEditor from "./CppLanEditor";
import "./CppPlayGround.css";
import SideDrawer from "../../../SideDrawer/SideDrawer";
import ACTIONS from "../../../../Actions";
import { initSocket } from "../../../../socket";
import { initialCpp, initialOutput } from "../../initialValues";
import useLocalStorage from "../../../../hooks/useLocalStorage";
import "./CppPlayGround.css";
import InputEditor from "./Ip_Op_Editor/InputEditor";
import OutputEditor from "./Ip_Op_Editor/OutputEditor";
import { useDispatch, useSelector } from "react-redux";
import { cppOutput } from "../../../../Redux/Features/compileSlice";
const CppPlayGround = () => {
  const [input, setInput] = useLocalStorage("inputCpp", "");
  const [cpp, setCpp] = useLocalStorage("cpp", initialCpp);
  const reactNavigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const [avatars, setAvatars] = useState([]);
  const handleSubmitCode = () => {
    dispatch(cppOutput());
  };
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", err => handleErrors(err));
      socketRef.current.on("connect_failed", err => handleErrors(err));
      function handleErrors(e) {
        toast.error("Socket connection failed, Try again later");
        reactNavigate("/");
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });
      //Listening for the joined  event from the server
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
          }
          setAvatars(clients);
          const newCpp = JSON.parse(localStorage.getItem("code4sharecpp"));
          const newCppInput = JSON.parse(
            localStorage.getItem("code4shareinputCpp")
          );
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            socketId,
            code: newCpp,
            lan: "cpp",
          });
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            socketId,
            code: newCppInput,
            lan: "inputCpp",
          });
          const newCppOutput = JSON.parse(
            localStorage.getItem("code4shareoutputCpp")
          );
          socketRef.current.emit(ACTIONS.OUTPUT_SYNC, {
            socketId,
            stdout: newCppOutput,
            lan: "outputCpp",
          });
        }
      );
      //Listening for the disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setAvatars(prev => {
          return prev.filter(client => client.socketId !== socketId);
        });
      });
    };
    //whenever we have used the listener we have to remove it due to memory leak problem
    init();
    return () => {
      //disconnecting from actions that are listening to the socket
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    };
  }, []);
  if (!location.state) {
    <Navigate to="/" />;
  }
  return (
    <>
      <div>
        <div className="pane top-pane">
          <CppLanEditor
            value={cpp}
            onChange={setCpp}
            socketRef={socketRef}
            roomId={roomId}
            onCodeSubmit={handleSubmitCode}
          />
        </div>
        <div className="center_textArea">
          <InputEditor
            value={input}
            onChange={setInput}
            roomId={roomId}
            socketRef={socketRef}
          />
          <OutputEditor roomId={roomId} socketRef={socketRef} />
        </div>
      </div>
      <div>
        <SideDrawer roomId={roomId} clients={avatars} />
      </div>
    </>
  );
};

export default CppPlayGround;