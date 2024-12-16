import { Text, Table, Loader, SemiCircleProgress, Spoiler, List, ThemeIcon, rem, Button } from '@mantine/core';
import { IconCircleCheck, IconLock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { parseBody } from '~/common/parseBody';

type ImageProp = {
  iid: number,
  name: string,
  User: string,
  public: boolean
}

type DeviceProp = {
  did: number,
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
  ip: string,
  images: ImageProp[]
}

export default function Market () {
  const [fetching, setFetching] = useState(true);
  const [devices_data, setDevicesData] = useState<DeviceProp[]>([]);
  let navigate = useNavigate();

  const getDeviceList = async () => {
    let ret : string[] = [];
    try {
      const response : Response = await fetch('/devices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : string[] = JSON.parse(await parseBody(response));

      if (!response.ok) {
        console.error('Get devies failed');
        throw new Error('Get devies failed');
      }

      ret =  parsedResult;
    } catch (err: any) {
      // TODO
    }
    return ret;
  }

  const getImagesOnDevice = async (did: string) => {
    let images : ImageProp[] = [];
    try {
      const response : Response = await fetch('/images/on/' + did, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : ImageProp[] = JSON.parse(await parseBody(response));

      if (!response.ok) {
        throw new Error('Get image property failed');
      }

      images = parsedResult;
    } catch (err: any) {
      // TODO
    }
    return images;
  }

  const getDeviceProperty = async (did: string) => {
    let property : DeviceProp = {
      did: 0,
      total_cpu: 0,
      used_cpu: 0,
      cpu_name: "Error",
      total_memory: 0,
      used_memory: 0,
      gpus: [],
      gpu_used: [],
      ip: "Error",
      images: []
    }
    try {
      const response : Response = await fetch('/devices/property/' + did, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : DeviceProp = JSON.parse(await parseBody(response));

      if (!response.ok) {
        throw new Error('Get device property failed');
      }

      property = parsedResult;
    } catch (err: any) {
      // TODO
    }
    property.images = await getImagesOnDevice(did);
    return property;
  }

  const refreshTable = async () => {
    setFetching(true);
    const devices = await getDeviceList();
    var data: DeviceProp[] = await Promise.all(devices.map(async (did) => {
      const device_prop = await getDeviceProperty(did);
      device_prop.did = Number(did);
      return device_prop;
    }));
    setDevicesData(data);
    setFetching(false);
  }

  useEffect(() => {
    refreshTable();
  }, []);

  return ( fetching ? <div className='flex h-full items-center justify-center'><Loader color="rgba(255, 31, 31, 0.6)" size="xl" /></div> :
    <Table data={{
      caption: devices_data.length > 0 ? '' : '暂时没有任何设备',
      head: [
        <p className='text-center'>设备ID</p>,
        <p className='text-center'>宿主机详情</p>,
        <p className='text-center'>宿主机空闲资源</p>,
        <p className='text-center'>可用镜像</p>,
        <p className='text-center'>操作</p>
      ],
      body: devices_data.map((device_data) => {
        // NOTE: 目前默认每个worker节点只有一种GPU

        const ratioColor = (value: number) => {
          const red = Math.round(255 * (1 - value));
          const green = Math.round(255 * value);
          const blue = 0; 
          return `rgba(${red}, ${green}, ${blue}, 0.5)`;
        }

        const host_data = [{
            title: 'IP',
            label: device_data.ip
          },{
            title: 'CPU',
            label: device_data.cpu_name
          },{
            title: 'GPU',
            label: device_data.gpus.length > 0 ? device_data.gpus[0].gpu_type : '无GPU'
        }]

        const chart_data = [{
          ratio: 1 - device_data.gpu_used.length / device_data.gpus.length,
          label: `GPU: ${device_data.gpus.length - device_data.gpu_used.length}/${device_data.gpus.length}`
        },{
          ratio: 1 - device_data.used_cpu / device_data.total_cpu,
          label: `CPU: ${device_data.total_cpu - device_data.used_cpu}/${device_data.total_cpu}`
        },{
          ratio: 1- device_data.used_memory / device_data.total_memory,
          label: `内存: ${(device_data.total_memory - device_data.used_memory) / 1024}GiB/${device_data.total_memory / 1024}GiB`
        }];

        return [
          <div className='text-center'>
            <Text fw={700}>
              {device_data.did}
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
          <div className='flex justify-center'>
            {chart_data.map((value => { return (
              <SemiCircleProgress
                fillDirection="left-to-right"
                orientation="up"
                filledSegmentColor={ratioColor(value.ratio)}
                size={150}
                thickness={12}
                value={100 * value.ratio}
                label={value.label}
              />
            )}))}
          </div>,
          <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide" transitionDuration={0}>
            <List
              spacing="xs"
              size="xs"
              center
              icon={
                <ThemeIcon color="teal" size={18} radius="xl">
                  <IconCircleCheck style={{ width: rem(18), height: rem(18) }} />
                </ThemeIcon>
              }
            >
              {device_data.images.map((image_data)=>{return(
                <List.Item>
                  <div className='flex flex-row space-x-1 whitespace-nowrap'>
                    <Text size='sm' span={true} c='rgba(0, 150, 150, 0.8)'>{image_data.name}</Text>
                    <Text size='sm' span={true} c='rgba(0, 0, 0, 0.5)'>{`(ID:${image_data.iid})`}</Text>
                    <Text size='sm' span={true} c='rgba(0, 0, 200, 0.5)'>{image_data.User != 'public' && `${image_data.User}`}</Text>
                    {!image_data.public && <IconLock color='rgba(0, 0, 200, 0.5)' style={{ width: rem(12), height: rem(12) }} /> }
                  </div>
                </List.Item>
              )})}
            </List>
          </Spoiler>,
          <div className='flex flex-col gap-4'>
            <Button variant="light" onClick={() => navigate('/market/' + device_data.did)} >
              创建容器实例
            </Button>
          </div>
        ];
      })
    }} />
  );
}