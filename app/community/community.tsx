import { Text, Table, TableData, SemiCircleProgress, Avatar } from '@mantine/core';
import { useEffect, useState } from 'react';
import { parseBody } from '~/common/parseBody';

type ImageProp = {
  did: string,
  name: string,
  public: boolean,
  user: string,
  size: number
}

type DeviceProp = {
  total_cpu: number,
  used_cpu: number,
  cpu_name: string,
  total_memory: number,
  used_memory: number,
  gpus: {
    gid: number
    gpu_type: string
  }[]
  gpu_used: number[],
  ip: string
}

export default function Community () {
  const [table_data, setTableData] = useState<TableData>({});

  const getImageList = async () => {
    let ret : string[] = [];
    try {
      const response : Response = await fetch('/images/public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : string[] = JSON.parse(await parseBody(response));

      if (!response.ok) {
        console.error('Get images failed');
        throw new Error('Get images failed');
      }

      ret =  parsedResult;
    } catch (err: any) {
      // TODO
    }
    return ret;
  }

  const getImageProperty = async (iid: string) => {
    let property : ImageProp = {
      did: "Error",
      name: "Error",
      public: false,
      user: "Error",
      size: 0
    }
    try {
      const response : Response = await fetch('/images/property/'+iid, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : ImageProp = JSON.parse(await parseBody(response));

      if (!response.ok) {
        throw new Error('Get image property failed');
      }

      property = parsedResult;
    } catch (err: any) {
      // TODO
    }
    return property;
  }

  const getDeviceProperty = async (did: string) => {
    let property : DeviceProp = {
      total_cpu: 0,
      used_cpu: 0,
      cpu_name: "Error",
      total_memory: 0,
      used_memory: 0,
      gpus: [],
      gpu_used: [],
      ip: "Error",
    }
    try {
      const response : Response = await fetch('/devices/property/'+did, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : DeviceProp = JSON.parse(await parseBody(response));

      if (!response.ok) {
        throw new Error('Get image property failed');
      }

      property = parsedResult;
    } catch (err: any) {
      // TODO
    }
    return property;
  }

  const refreshTable = async () => {
    const images = await getImageList();
    var _body: JSX.Element[][] = await Promise.all(images.map(async (iid) => {
      const image_prop = await getImageProperty(iid);
      const device_prop = await getDeviceProperty(image_prop.did);

      // NOTE: 目前默认每个worker节点只有一种GPU

      const ratioColor = (value: number) => {
        const red = Math.round(255 * (1 - value));
        const green = Math.round(255 * value);
        const blue = 0; 
        return `rgba(${red}, ${green}, ${blue}, 0.5)`;
      }

      const host_data = [{
          title: '设备ID',
          label: image_prop.did
        },{
          title: 'IP',
          label: device_prop.ip
        },{
          title: 'CPU',
          label: device_prop.cpu_name
        },{
          title: 'GPU',
          label: device_prop.gpus.length > 0 ? device_prop.gpus[0].gpu_type : '无GPU'
      }]

      const chart_data = [{
        ratio: 1 - device_prop.gpu_used.length / device_prop.gpus.length,
        label: `GPU: ${device_prop.gpus.length - device_prop.gpu_used.length}/${device_prop.gpus.length}`
      },{
        ratio: 1 - device_prop.used_cpu / device_prop.total_cpu,
        label: `CPU: ${device_prop.total_cpu - device_prop.used_cpu}/${device_prop.total_cpu}`
      },{
        ratio: 1- device_prop.used_memory / device_prop.total_memory,
        label: `内存: ${(device_prop.total_memory - device_prop.used_memory) / 1024}GiB/${device_prop.total_memory / 1024}GiB`
      }];

      return [
        <div className='text-center'>
          <Text fw={700}>
            {image_prop.name}
          </Text>
          <Text size="sm" c="gray.6">
            ID: {iid}
          </Text>
        </div>,
        <div className='text-center'>
          <Text fw={700} c="blue.6">
            {(image_prop.size / 1024 ** 2) > 1024 ? (image_prop.size / 1024 ** 3).toFixed(2) + 'GiB' : (image_prop.size / 1024 ** 2).toFixed(2) + 'MiB'}
          </Text>
        </div>,
        <div className=''>
          <Table variant="vertical" layout="auto">
            <Table.Tbody>
              {host_data.map((value => { return (
                <Table.Tr>
                 <Table.Th w={85}>{value.title}</Table.Th>
                 <Table.Td>{value.label}</Table.Td>
                </Table.Tr>
              )}))}
            </Table.Tbody>
          </Table>
        </div>,
        <div className='text-center'>
            {image_prop.user == 'public' ?
              <Text fw={700} c="teal.6">公共镜像</Text>:
              <div className='flex justify-center flex-col items-center'>
                <Avatar key={image_prop.user} name={image_prop.user} color="initials" allowedInitialsColors={['blue', 'red']} radius="xl"/>
                <Text fw={500} c="gray.6">{image_prop.user}</Text>
              </div>
            }
        </div>
      ];
    }));

    setTableData({
      caption: _body.length > 0 ? '' : '您还没有创建任何镜像',
      head: [
        <p className='text-center'>镜像ID/名称</p>,
        <p className='text-center'>大小</p>,
        <p className='text-center'>宿主机详情</p>,
        <p className='text-center'>创建者</p>
      ],
      body:  _body
    });
  }

  useEffect(() => {
    refreshTable();
  }, []);

  return (
    <Table data={table_data} />
  );
}