import { Table, TableData, CopyButton, Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useState } from 'react';

type ContainerProp = {
  cid: number,
  status: string,
  name: string,
  cpu: string,
  memory: string,
  portssh: string,
  portjupyter: string,
  porttsb: string,
  passwd: string,
  ip: string,
  cpu_name: string,
  gpu_type: string
}

export default function Containers () {
  const [container_list, setContainerList] = useState<string[]>([]);
  const [table_body, setTableBody] = useState<ContainerProp[]>([]);

  const getContainerList = async () => {
    try {
      const response : Response = await fetch('/containers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let result :string = '';
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      }

      let parsedResult : {status: number, cid: []} = JSON.parse(result)

      if (!response.ok || parsedResult.status !== 0 || !parsedResult.cid) {
        console.error('Get containers failed');
        throw new Error('Get containers failed');
      }

      console.log(parsedResult)

      setContainerList(parsedResult.cid);
    } catch (err: any) {
      // TODO
    }
  }

  const getContainerStatus = async (cid: string) => {
    let status : string = 'Error';
    try {
      const response : Response = await fetch('/containers/status/'+cid, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let result :string = '';
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      }

      let parsedResult : {status: number, result: string, error: string} = JSON.parse(result)

      if (!response.ok || parsedResult.status !== 0 || !parsedResult.result) {
        throw new Error('Get container status failed');
      }

      status = parsedResult.result;
    } catch (err: any) {
      // TODO
    }
    return status;
  }

  const getContainerProperty = async (cid: string) => {
    let property : ContainerProp = {
      cid: Number(cid),
      status: "Error",
      name: "Error",
      cpu: "Error",
      memory: "Error",
      portssh: "Error",
      portjupyter: "Error",
      porttsb: "Error",
      passwd: "Error",
      ip: "Error",
      cpu_name: "Error",
      gpu_type: "Error"
    };
    try {
      const response : Response = await fetch('/containers/property/'+cid, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let result :string = '';
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      }

      let parsedResult : ContainerProp = JSON.parse(result)

      if (!response.ok || parsedResult.status !== "0") {
        throw new Error('Get container property failed');
      }

      property = parsedResult;
    } catch (err: any) {
      // TODO
    }
    return property;
  }

  var tableData: TableData

  getContainerList().then( async () => {
    var _body = await Promise.all(container_list.map(async (cid) => {
      let property : ContainerProp = {
        cid: Number(cid),
        status: "Unknown",
        name: "Unknown",
        cpu: "Unknown",
        memory: "Unknown",
        portssh: "Unknown",
        portjupyter: "Unknown",
        porttsb: "Unknown",
        passwd: "Unknown",
        ip: "Unknown",
        cpu_name: "Unknown",
        gpu_type: "Unknown"
      };
      try {
        property.status = await getContainerStatus(cid);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
      try {
        let _property = await getContainerProperty(cid);
        property.name = _property.name;
        property.cpu = _property.cpu;
        property.memory = _property.memory;
        property.portssh = _property.portssh;
        property.portjupyter = _property.portjupyter;
        property.porttsb = _property.porttsb;
        property.passwd = _property.passwd;
        property.ip = _property.ip;
        property.cpu_name = _property.cpu_name;
        property.gpu_type = _property.gpu_type;   
      }catch (error) {
        console.error('Error fetching specifications:', error);
      }
      return property;
    }));

    setTableBody(_body);
  });

  tableData = {
    caption: 'Some elements from periodic table',
    head: ['实例ID/名称', '状态', '规格详情', '本地磁盘', 'SSH登录', 'Jupyter面板', 'TensorBoard', 'Grafana面板'],
    body: table_body.map((prop) => {
      return [
        <p className=''>
          Name: {prop.name}<br />
          ID: {prop.cid}<br />
          IP: {prop.ip}
        </p>,
        <p className=''>
          {prop.status}
        </p>,
        <p className=''>
          CPU信号: {prop.cpu_name}<br />
          CPU核心: {prop.cpu}<br />
          GPU型号: {prop.gpu_type}<br />
          内存: {prop.memory}
        </p>,
        <p className=''>
          TODO?
        </p>,
        <div className='' >
          ssh root@{prop.ip}:{prop.portssh}<br />
          <CopyButton value={prop.passwd}>
            {({ copied, copy }) => (
              <Button
                color={copied ? 'teal' : 'blue'}
                onClick={copy}
                rightSection={<IconDownload size={14} />}
                size="compact-xs"
              >
                {copied ? '复制密码' : '已复制'}
              </Button>
            )}
          </CopyButton>
        </div>,
        <div className='' >
          <a href = {'http://' + prop.ip + ':' + prop.portjupyter}>
            http://{prop.ip}:{prop.portjupyter}
          </a><br />
          <p>密码和 SSH 密码一致</p>
        </div>,
        <div className='' >
          <a href = {'http://' + prop.ip + ':' + prop.porttsb}>
            http://{prop.ip}:{prop.porttsb}
          </a>
        </div>,
        <div className='' >
          <a href = {'http://' + prop.ip + ':3000'}>
            http://{prop.ip}:3000
          </a>
        </div>,
      ]
    })
  };

  return (
    <Table data={tableData} />
  );
}