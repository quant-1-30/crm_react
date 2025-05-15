import React, {useState} from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// import axios from 'axios';
import axios from '../utils/axios';


const FileUploader = ({table, onUploadSuccess}) => {
  console.log("uploading to table:", table);

  const headers = {
    'Content-Type': "multipart/form-data",
  };

  const [fileList, setFileList] = useState([]);

  const uploadProps = {
    onRemove: file => {
      setFileList(prevFileList => {
        const index = prevFileList.indexOf(file);
        const newFileList = prevFileList.slice();
        // remove file startIndex, deleteCount
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: file => {
      setFileList(prevFileList => [...prevFileList, file]);
      return false;
    },
    fileList,
  };

  const handleUpload = async () => {
    const formData = new FormData ();
    // add file
    console.log("files", fileList);
    fileList.forEach(file => {
      // formData.append("file[]", file);
      formData.append("files", file);
    });
    formData.append("table", table);

    console.log("formData entries", Array.from(formData.entries()));


    try {
      const response = await axios.post('/component/upload', 
        formData, 
      {
        headers: headers,
      },
    );
    console.log("upload response ", response.data);
    if (parseInt(response.data.status) === 0) {
        onUploadSuccess(response.data.data);
        message.success("文件上传成功 ", response.data.success);
    } else {
      message.error('文件上传失败');
    }
    } catch (error) {
      message.error('上传时发生错误, 请稍后重试');
    }
  };
  
  return (
    <div>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} >选择文件</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        style={{ marginTop: 16 }}
      >
        上传
      </Button>
    </div>
  )

};

export default FileUploader;
