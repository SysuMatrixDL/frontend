import { Image, Text, Grid, TextInput, CloseButton, Button, Slider, Container, NumberInput, Select, Table, Stepper, Transition, Paper } from "@mantine/core";
import { IconCardsFilled, IconCpu2, IconFlameFilled, IconPackage, IconRocket, IconRosetteDiscountCheckFilled, IconTagFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Route } from "./+types/create";
import { parseBody } from "~/common/parseBody";
import { useNavigate } from "react-router";

type ImageProp = {
  iid: number,
  name: string,
  User: string,
  public: boolean,
  label: string
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

type DeviceData = {
  did: number,
  cpu_name: string,
  gpu_name: string,
  free_cpu: number,
  free_memory: number,
  free_gpus: number[],
  images: ImageProp[]
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
  
  var images = await getImagesOnDevice(did);
  property.images = images.map((i) => {
    i.label = `${i.name} (ID:${i.iid})`;
    return i;
  });
  return property;
}

export default function Create({params}: Route.ComponentProps) {
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tran, setTran] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gpu, setGPU] = useState(0);
  const [cpu, setCPU] = useState(0);
  const [mem, setMem] = useState(0);
  const [image, setImage] = useState<ImageProp>();
  const [device_data, setDevicesData] = useState<DeviceData>();
  const [gpuMarks, setGPUMarks] = useState<{value: number}[]>([])
  const [cpuMarks, setCPUMarks] = useState<{value: number}[]>([])
  
  let navigate = useNavigate();

  const createContainer = async () => {
    try {
      const response : Response = await fetch('/containers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify({
          iid: image?.iid,
          name: name,
          cpu: cpu,
          mem: mem,
          gid: device_data?.free_gpus.slice(0, gpu)  // 按顺序选前面几个
        }),
        credentials: 'include'
      });

      let parsedResult : {status: number, error: string} = JSON.parse(await parseBody(response));

      if (!response.ok || parsedResult.status !== 0 || parsedResult.error) {
        console.error(`Update container status failed: ${parsedResult.error}`);
        throw new Error(`Update container status failed: ${parsedResult.error}`);
      }
      setSuccess(true);
    } catch (err: any) {
      setSuccess(false);
      setError(err.error);
    }
    setTran(true);
    setTimeout(() => {
      setStep(6);
      setCreating(false);
    }, 400);
  }

  const fetch_data = async () => {
    let _device_data : DeviceData = {
      did: 0,
      cpu_name: "Error",
      gpu_name: "Error",
      free_cpu: 0,
      free_memory: 0,
      free_gpus: [],
      images: [] as ImageProp[]
    }
    
    const data = await getDeviceProperty(params.did);
    _device_data.did = Number(params.did);
    _device_data.images = data.images;
    _device_data.free_cpu = data.total_cpu - data.used_cpu;
    _device_data.free_memory = data.total_memory - data.used_memory;
    _device_data.cpu_name = data.cpu_name;
    if(data.gpus.length - data.gpu_used.length > 0){
      _device_data.gpu_name = data.gpus[0].gpu_type;
      _device_data.free_gpus = data.gpus.map(({gid}) => gid).filter(gid => !data.gpu_used.includes(gid));
    } else {
      _device_data.gpu_name = '无GPU';
    }
    setGPUMarks(Array.from({ length: _device_data.free_gpus.length + 1 }).map((_, idx) => {
      return {value: idx}
    }));
    setCPUMarks(Array.from({ length: _device_data.free_cpu + 1 }).map((_, idx) => {
      return {value: idx}
    }));
    setDevicesData(_device_data);
  }

  useEffect( () => {
    fetch_data();
  }, []);

  useEffect( () => {
    if(tran){
      setTimeout(() => {
        setTran(false);
      }, 400);
    }
  }, [tran]);
  
  return (
    <Grid>
      <Grid.Col span="auto">
        <div className="flex justify-center">
          <Container px={10} w={400}><Grid>
            <Grid.Col span={12} h={150}></Grid.Col>
            <Grid.Col span={12} h={100}>
              <Transition mounted={tran} transition="fade" timingFunction="">
                {(transitionStyle) => (
                  <Paper
                    h={250}
                    w={500}
                    pos="absolute"
                    style={{ ...transitionStyle, zIndex: 1000 }}
                  />
                )}
              </Transition>
              { step == 0 && <TextInput
                withAsterisk
                label="容器名称"
                placeholder="your container name"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                rightSectionPointerEvents="all"
                mt="md"
                rightSection={
                  <CloseButton
                    aria-label="Clear input"
                    onClick={() => setName('')}
                    style={{ display: name ? undefined : 'none' }}
                  />
                }
              /> }
              { step == 1 && ( <div className="flex flex-col gap-5">
                <Text size="sm" c='gray.6'>
                  {gpuMarks.length == 1 ? '无GPU' : `${device_data?.gpu_name} 总共可用数量: ${gpuMarks.length - 1}`}<br/>{`已选择: ${gpu}`}<br/>
                  {/* {`已选择: ${}`} */}
                </Text>
                <Slider
                  restrictToMarks
                  max={gpuMarks.length - 1}
                  defaultValue={gpuMarks.length - 1}
                  marks={gpuMarks}
                  styles={{ markLabel: { display: 'none' } }}
                  color="rgba(255, 150, 150, 0.5)"
                  value={gpu}
                  onChange={(value) => setGPU(value)}
                />
              </div> ) }
              { step == 2 && ( <div className="flex flex-col gap-5">
                <Text size="sm" c='gray.6'>
                  {`${device_data?.cpu_name} 总共可用核心数量: ${cpuMarks.length - 1}`}<br/>{`已选择: ${cpu}`}<br/>
                  {/* {`已选择: ${}`} */}
                </Text>
                <Slider
                  restrictToMarks
                  max={cpuMarks.length - 1}
                  defaultValue={cpuMarks.length - 1}
                  marks={cpuMarks}
                  styles={{ markLabel: { display: 'none' } }}
                  color="rgba(255, 150, 150, 0.5)"
                  value={cpu}
                  onChange={(value) => setCPU(value)}
                />
              </div> ) }
              { step == 3 && ( <div className="flex flex-col gap-5">
                <Text size="sm" c='gray.6'>{`宿主机最大内存限制: ${device_data?.free_memory} MiB`}<br/>{`至少为 1024 MiB, 已设置: ${mem}`}</Text>
                <NumberInput
                  placeholder="memory"
                  clampBehavior="strict"
                  min={0}
                  max={device_data?.free_memory}
                  suffix=" MiB"
                  value={mem}
                  onChange={(value) => setMem(Number(value))}
                />
              </div> ) }
              { step == 4 && ( <div className="flex flex-col gap-5">
                <Select
                  label="选择一个镜像作为创建容器实例的基础镜像"
                  placeholder="image"
                  data={device_data?.images.map((i) => i.label)}
                  searchable
                  value={image?.label}
                  onChange={(v) => {
                    const idx = device_data?.images.findIndex((i) => i.label == v);
                    setImage(device_data?.images[idx?idx:0]);
                  }}
                />
              </div> ) }
              { step == 5 && !creating && ( <div className="flex flex-col gap-5 text-center">
                <Text size="sm" c='gray.6'>请确认您的配置</Text>
                <Table variant="vertical" layout="auto">
                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Th w={100}>名称</Table.Th>
                      <Table.Td>{name}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Th w={100}>GPU</Table.Th>
                      <Table.Td>{gpu == 0 ? '无GPU' : `${device_data?.gpu_name} X ${gpu}`}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Th w={100}>CPU核心</Table.Th>
                      <Table.Td>{cpu}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Th w={100}>内存</Table.Th>
                      <Table.Td>{mem}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Th w={100}>基础镜像</Table.Th>
                      <Table.Td>{image?.label}</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </div> ) }
              { step == 5 && creating && <div className="flex justify-center">
                <Text size="xl" c='rgba(0, 150, 150, 0.8)'>正在创建您的容器实例...</Text>
              </div> }
              { step == 6 && success && <div className="flex justify-center">
                <Text size="xl" c='green.6'>创建成功!</Text>
              </div> }
              { step == 6 && !success && <div className="flex justify-center">
                <Text size="xl" c='red.6'>创建失败: {error}</Text>
              </div> }
            </Grid.Col>
            <Grid.Col span={12} h={150}>
              <div className="flex flex-row justify-center">
                {step == 0 && <Image h={150} w="auto" fit="contain" src='/taffy1.png'/>}
                {step == 0 && <Image h={150} w="auto" fit="contain" src='/taffy2.png'/>}
                {step == 1 && <Image h={150} w="auto" fit="contain" src='/taffy3.png'/>}
                {step == 1 && <Image h={150} w="auto" fit="contain" src='/taffy4.png'/>}
                {step == 2 && <Image h={150} w="auto" fit="contain" src='/taffy5.png'/>}
                {step == 2 && <Image h={150} w="auto" fit="contain" src='/taffy6.png'/>}
                {step == 3 && <Image h={150} w="auto" fit="contain" src='/taffy7.png'/>}
                {step == 4 && <Image h={150} w="auto" fit="contain" src='/taffy8.png'/>}
                {step == 5 && creating && <Image h={150} w="auto" fit="contain" src='/taffy14.png'/>}
                {step == 6 && success && <Image h={150} w="auto" fit="contain" src='/taffy15.png'/>}
                {step == 6 && !success && <Image h={150} w="auto" fit="contain" src='/taffy16.png'/>}
              </div>
            </Grid.Col>
            <Grid.Col span={12} h={100}>
              <div className="flex flex-row gap-2 m-2">
                <Button
                  disabled={step == 0 || step == 6 || creating}
                  variant="light"
                  fullWidth
                  onClick={() => {
                    setTran(true);
                    setTimeout(() => {
                      setStep(step - 1);
                    }, 400);
                  }}
                >
                  上一步
                </Button>
                <Button
                  disabled={
                    (!name && step == 0) ||
                    (cpu == 0 && step == 2) ||
                    (mem < 1024 && step == 3) ||
                    (!image && step == 4) ||
                    creating
                  }
                  variant="light"
                  fullWidth
                  onClick={() => {
                    if(step == 6){
                      navigate('/console')
                    } else if(step == 5){
                      createContainer();
                      setTran(true);
                      setTimeout(() => {
                        setCreating(true);
                      }, 400);
                    } else {
                      setTran(true);
                      setTimeout(() => {
                        setStep(step + 1);
                      }, 400);
                    }
                  }}
                >
                  {step == 5 ? '创建' : step == 6 ? '前往控制台' : '确认'}
                </Button>
              </div>
            </Grid.Col>
          </Grid></Container>
        </div>
      </Grid.Col>
      <Grid.Col span={3} >
        <Stepper active={step} orientation="vertical" color="rgba(255, 150, 150, 0.7)">
          <Stepper.Step label="命名" description="给您的新容器实例命名" icon={<IconTagFilled size={24} />} />
          <Stepper.Step label="GPU" description="配置GPU数量" icon={<IconFlameFilled size={24} />} />
          <Stepper.Step label="CPU" description="配置CPU核心数量" icon={<IconCpu2 size={24}/>} />
          <Stepper.Step label="内存" description="配置内存大小" icon={<IconCardsFilled size={24}/> } />
          <Stepper.Step label="镜像" description="选择新容器实例的基础镜像" icon={<IconPackage size={24} />} />
          <Stepper.Step label="创建" description="创建新容器实例" icon={<IconRocket size={24} />} />
          <Stepper.Step label="完成" description="创建完毕,可以到控制台启动和管理容器实例" icon={<IconRosetteDiscountCheckFilled size={24} />} />
        </Stepper>
      </Grid.Col>
    </Grid>
  );
}