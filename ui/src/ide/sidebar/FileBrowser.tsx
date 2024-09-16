import React, { useEffect, useState } from 'react';
import { BaseApiUrl } from '../config';
import ContextMenu from './ContextMenu';

interface IContent {
    type: string,
    path: string,
    name: string,
    content: IContent[]
}

export default function FileBrowser({ sendDataToParent }) {

    const [menuPosition, setMenuPosition] = useState<{ xPos: number; yPos: number } | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  
    const handleRightClick = (event: React.MouseEvent) => {
      event.preventDefault();
      setMenuPosition({ xPos: event.pageX, yPos: event.pageY });
      setIsMenuVisible(true);
    };
  
    const handleCloseMenu = () => {
      setIsMenuVisible(false);
    };

    

    const [contents, setContents] = useState<IContent[]>([]);

    const [cwd, setCwd] = useState<String>("");


    const directoryRightClickHandler = (e, hey) => {
        e.preventDefault(); // prevent the default behaviour when right clicked
        console.log("Right Click");

        setMenuPosition({ xPos: e.pageX, yPos: e.pageY });
        setIsMenuVisible(true);
    }


    const menuItems = [
        { label: 'Rename', action: () => alert('Rename') },
        { label: 'Delete', action: () => alert('Delete') },
    ];


    const FetchData = async () => {
        const res = await fetch(BaseApiUrl + "/api/contents?type=notebook&hash=0", {
            method: 'POST',

            body: JSON.stringify({
                path: cwd
            })
        });
        const resJson = await res.json();
        console.log(resJson)
        setContents(resJson['content']);
    };

    const handleFileClick = async (path: string, type: string) => {
        sendDataToParent(path, type);
    };

    const showNewFileDialog = () => {
        console.log("New file");
    }

    const createNewFile = async () => {
        let path = "abc.py";
        const res = await fetch(BaseApiUrl + "/api/contents/create", {
            method: 'POST',

            body: JSON.stringify({
                ext: '.py',
                type: 'file'
            })
        });
        FetchData();
    }

    const createNewDirectory = async () => {
        let path = "abc.py";
        const res = await fetch(BaseApiUrl + "/api/contents/create" + path, {
            method: 'POST',
            body: JSON.stringify({
                type: 'directory'
            })
        });
        FetchData();
    }

    useEffect(() => {
        FetchData();
    }, [cwd])

    return (
        <div className="nav-content">
            <div className="content-head">
                <h6>{cwd}</h6>
                <h6>Files</h6>
                <div>
                    <button className='editor-button' onClick={createNewFile}><img src="./images/editor/feather-file-plus.svg" alt="" /></button>
                    <button className='editor-button' onClick={createNewDirectory}><img src="./images/editor/feather-folder-plus.svg" alt="" /></button>
                </div>
            </div>
            <div className="content-inner">
                <ul className="file-list list-unstyled">
                    {contents.map((content, index) => {
                        if (content.type === "directory") {
                            return <DirectoryItem key={index} 
                            directoryRightClickHandler={directoryRightClickHandler}
                            data = {content}
                            sendDataToParent={sendDataToParent}/>
                        } else {
                            return <FileItem key={index} 
                            directoryRightClickHandler={directoryRightClickHandler}
                            handleFileClick = {handleFileClick}
                            content = {content}/>
                        }
                    }
                    )}
                </ul>
            </div>
            <div>
                {isMenuVisible && menuPosition && (
                    <ContextMenu
                    xPos={menuPosition.xPos}
                    yPos={menuPosition.yPos}
                    items={menuItems}
                    onClose={handleCloseMenu}
                    />
                )}
            </div>
        </div>
    )
}

function FileItem({directoryRightClickHandler, handleFileClick, content}){
    return <li><a onContextMenu={(e) => directoryRightClickHandler(e, "hi")} onClick={() => handleFileClick(content.path, content.type)}><img src="./images/editor/py-icon.svg" alt="" /> {content.name}</a></li>
}

function DirectoryItem({directoryRightClickHandler, data, sendDataToParent}){
    const [content, setContent] = useState<IContent>(data);

    const handleFileClick = async (path: string, type: string) => {
        sendDataToParent(path, type);
    };


    const FetchData = async (path) => {
        const res = await fetch(BaseApiUrl + "/api/contents?type=notebook&hash=0", {
            method: 'POST',

            body: JSON.stringify({
                path: path
            })
        });
        const resJson = await res.json();
        console.log(resJson)
        setContent(resJson);
    };

    const handleDirectoryClick = async (path: string, type: string) => {
        FetchData(path)
    };
    useEffect(() => {
    }, [])

    return (
        <li>
            <a onContextMenu={(e) => directoryRightClickHandler(e, "hi")} onClick={() => handleDirectoryClick(content.path, content.type)}>
                <img src="./images/editor/directory.svg" alt="" /> 
                {content.name}
            </a>
            <ul>
                <ul className="file-list list-unstyled">
                    {content.content !==null && content.content.map((content, index) => {
                        if (content.type === "directory") {
                            return <DirectoryItem key={index} 
                            sendDataToParent={sendDataToParent}
                            directoryRightClickHandler={directoryRightClickHandler}
                            data = {content}/>
                        } else {
                            return <FileItem key={index} 
                            directoryRightClickHandler={directoryRightClickHandler}
                            handleFileClick = {handleFileClick}
                            content = {content}/>
                        }
                    }
                    )}
                </ul>
            </ul>
        </li>)   
}