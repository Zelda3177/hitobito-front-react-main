import { useEffect, useRef, useState } from 'react';
import ResumeMobile from '../../components/resume-mobile/resume-mobile';
import MobileBottom from '../../components/mobileBottom/mobile-bottom';

import CameraPhoto from "@/assets/images/camera.svg";
import Search from "@/assets/images/search.svg";
import blueX from "@/assets/images/blue-x.svg";
import attachIcon from "@/assets/images/attach-icon.svg";
import blacksmallX from "@/assets/images/black-small-x.svg";
import Download from "@/assets/images/download-icon.svg";
import Xbutton from "@/assets/images/x_button.svg";
import SelectBox from "./desktop-items/SelectBox";
import axios from "axios";
import { getCookie } from "../../utils/cookie";
import CareerWrite from "./desktop-items/CareerWrite";
import { useRecoilState } from "recoil";
import { mobileStatus } from "../../stores/mobile-status";
import { Lucide, Modal, ModalBody, ModalFooter, ModalHeader } from "@/base-components";
import DepthSplit from "../../../util/DepthSplit";
import ModalEvent from "./ModalEvent";

const ResumeRegist = () => {
  // const [selectPop, setselectPop] = useState(false);
  const [mobile, setMobileStatus] = useRecoilState(mobileStatus);
  const categoryRef = useRef(null);
  const skillNameRef = useRef(null)

  const [year, setYear] = useState(0)
  const [image, setImage] = useState([])
  const [career, setCareer] = useState([{ process: [] },])
  const [skillItem, setSkillItem] = useState({
    temp: {},
    arr: [],
  })
  const [depthMenu, setDepthMenu] = useState({
    hopeCareer: {
      depth: 0,
      depth_first: '目標 1',
      depth_seconds: '目標 2',
    },
    jobType: {
      depth: 0,
      depth_first: '職種 1',
      depth_seconds: '職種 2',
    },
    businessType: {
      depth: 0,
      depth_first: '業種 1',
      depth_seconds: '業種 2',
    },
  })

  const [data, setData] = useState()
  const [skillList, setSkillList] = useState({
    category: [],
    skillName: [],
    origin: [],
  })
  const [body, setBody] = useState({
    country: '',
    userAge: '',
    education: '',
    userGender: '',
    career: '',
    businessType: '',
    jobType: '',
    residentialArea: '',
    hopeCareer: '',
    hopeIncome: '',
    projectName: [],
    projectPeriod: [],
    projectRole: [],
    projectProcess: [],
    skillCode: [],
    careerCode: [],
    schoolName: '',
    majorName: '',
    phoneNumber: '',
    userEmail: '',
    additionalComment: '',
    phoneNumberFlag: '1',
    userEmailFlag: '1',
  })
  const [rsFilePhoto, setRsFilePhoto] = useState([])
  const [fileNames, setFileNames] = useState([])
  const [rsFileDocument, setRsFileDocument] = useState([])

  // 簡単な自己紹介 200자이상 fail
  const [infoLimitFail, setInfoLimitFail] = useState(false);

  const handleAgeCalculator = () => new Date().getFullYear() - year + '歳'

  // body 데이터 수정
  const handleSelectChangeEvent = (e) => {
    const key = e.target.id.replaceAll(' dropdown-button-dark-example1', '').replaceAll(' product-status-active', '')
    let value
    if (key === 'phoneNumberFlag' || key === 'userEmailFlag') {
      value = body[key] === '1' ? '0' : '1'
    } else {
      value = e.target.value
    }
    if (key === 'userAge') setYear(parseInt(e.nativeEvent.target[e.nativeEvent.target.selectedIndex].text.toString()))

    if (key === 'skillCode') {
      setBody(prevState => {
        return {
          ...body,
          skillCode: [...prevState.skillCode, e.target.value]
        }
      })
    } else {
      setBody({
        ...body,
        [key]: value
      })
    }
  }
  const handleCheckText = (e) => {
    const key = e.target.id.replaceAll(' regular-form-1', '')
    const value = e.target.value
    /*console.log(e.target)
    console.log(value)*/

    const emailCheck = /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/
    const phoneCheck = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/

    if (e.target.value !== '') {
      if (key === 'userEmail' && !emailCheck.test(value)) {
        alert('入力形式:abc@test.com.に合わせてください。')
        e.target.value = ''
        setBody({
          ...body,
          [key]: ''
        })
      }
      if (key === 'phoneNumber' && !phoneCheck.test(value)) {
        alert('入力形式:000-0000-0000.に合わせてください。')
        e.target.value = ''
        setBody({
          ...body,
          [key]: ''
        })
      }
      return false
    }

  }
  // input 데이터 수정
  const handleInputTextChangeEvent = (e) => {
    const key = e.target.id.replaceAll(' regular-form-1', '')
    const value = e.target.value
    if (value.length >= 201) {
      setInfoLimitFail(true)
    }
    setBody({
      ...body,
      [key]: value
    })

  }

  //이미지 업로드
  const handleChangeImage = async (e, index) => {
    const file = e.target.files
    if (file.length > 5) {
      alert('5個まで登録できます。')
      return false
    }

    setImage([])
    setRsFilePhoto([])

    for (let i = 0; i < file.length; i++) {
      const reader = new FileReader()
      reader.readAsDataURL(file[i])
      reader.onload = (res) => setImage(prevState => [...prevState, res.target.result])
      setRsFilePhoto(prevItem => [...prevItem, file[i]])
    }
  };
  const handleDeleteImage = (index) => {
    const newImages = [...image];
    const tempForm = [...rsFilePhoto]
    newImages.splice(index, 1);
    tempForm.splice(index, 1)
    setImage(newImages);
    setRsFilePhoto([...tempForm])
  };
  const previewItem = (<div className='image_item01'>
    <input
      id={`profileImg0`}
      type={'file'}
      multiple
      onChange={(e) => handleChangeImage(e, 0)}
    />
    <label className={'custom-input-label'} htmlFor={`profileImg0`}>
      <img src={CameraPhoto} alt='' />
    </label>
  </div>);

  //커리어 부분
  const handleCareerChangeAndProcess = (e, index, tempArr) => {
    const processTemp = [...career]
    const roleTemp = [...body.projectRole]
    const strArr = []
    processTemp[index].process = tempArr;
    processTemp.map((item, key) => {
      strArr[key] = item.process.toString()
    })

    roleTemp[index] = e.target.value
    setBody({
      ...body,
      projectRole: roleTemp,
      projectProcess: strArr
    })
  }

  const handleAddBtn = (e, idx) => {
    if (idx === 0) {
      setCareer(prevState => [...prevState, { process: [] }])
    } else {
      const tempArr = [...career]
      tempArr.splice(idx, 1)
      setCareer(tempArr)
    }
  }
  const handleCareerChange = async (e, idx) => {
    const id = e.target.id.replaceAll(' dropdown-button-dark-example1', '')
    const tempArr = [...body[id]]
    tempArr[idx] = id === 'projectPeriod' ? parseInt(e.target.value) : e.target.value
    await setBody({ ...body, [id]: tempArr })
  }
  const handleProjectProcessAdd = (e, idx, flag) => {
    const temp = [...career]
    if (e.target.checked) {
      temp[idx].process.push(e.target.value)
      temp[idx].process.map(item => item.sort)
      projectProcessEvent(temp)

    } else {
      handleProjectProcessDel(idx, e.target.value)
    }
  }
  const handleProjectProcessDel = (idx, target) => {
    const temp = [...career]
    const position = temp[idx].process.indexOf(target)
    temp[idx].process.splice(position, 1)
    projectProcessEvent(temp)
  }
  const projectProcessEvent = (arr) => {
    let strArr = []
    for (let i = 0; i < arr.length; i++) {
      strArr[i] = arr[i].process.toString()
    }
    setBody({ ...body, projectProcess: [...strArr] })
  }

  //스킬 부분
  const handleUpdateSkill = (e, item) => {
    const key = e.target.id.replaceAll(' regular-form-1', '').replaceAll(' dropdown-button-dark-example1', '')
    let value = ''
    if (!item) {
      value = e.nativeEvent.target[e.nativeEvent.target.selectedIndex].text.toString()
    }

    setSkillItem({
      ...skillItem,
      temp: {
        ...skillItem.temp,
        [key]: item ? item : {
          [key === 'skillCategory' ? key + 'Name' : 'careerYear']: value,
          [key === 'skillCategory' ? key + 'Code' : 'careerCode']: e.target.value
        }
      }
    })
  }

  const handleAddSkills = (e) => {

    if (skillItem.temp.skillCode && skillItem.temp.careerCode) {
      if (skillItem.arr.filter(skill => skill.name === skillItem.temp.skillCode.skillName).length > 0) {
        alert('スキルが重複されました。')
        document.querySelector('.refTarget_select').value = null;
        document.querySelectorAll('.refTarget_radio').forEach(radio => radio.checked = false)
        return
      }
      setBody({
        ...body,
        skillCode: [...body.skillCode, skillItem.temp.skillCode.skill],
        careerCode: [...body.careerCode, skillItem.temp.careerCode.careerCode],
      })
      setSkillItem({
        arr: [...skillItem.arr, {
          cate: skillItem.temp.skillCode.skillCategoryName,
          name: skillItem.temp.skillCode.skillName,
          year: skillItem.temp.careerCode.careerYear
        }],
        temp: {}
      })
      document.querySelector('.refTarget_select').value = null;
      document.querySelectorAll('.refTarget_radio').forEach(radio => radio.checked = false)
    } else {
      //alert('스킬이나 経歴이 선택되지 않았습니다.')
    }

  }


  // 파일 업로드 부분
  const handleFileUpload = (event) => {
    if (rsFileDocument.length >= 5) {
      alert("ファイルは５つまで添付できます。")
      return false;
    }
    const files = Array.from(event.target.files);
    files.map(file => {
      setRsFileDocument(prevItem => [...prevItem, file])
      setFileNames(prevItem => [...prevItem, file.name])
    })
  };
  const handleDeleteFile = (index) => {
    const updatedNames = [...fileNames];
    const updatedDocument = [...rsFileDocument];

    updatedNames.splice(index, 1);
    updatedDocument.splice(index, 1);

    setFileNames(updatedNames);
    setRsFileDocument(updatedDocument);
  };

  // 전송
  const handleSubmit = async () => {
    const formData = new FormData()
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
    await formData.append('request', blob)

    rsFileDocument.length > 0 ? rsFileDocument.map(item => formData.append('rsFileDocument', item)) : formData.append('rsFileDocument', new File([], 'photo.jpg'))
    rsFilePhoto.length > 0 ? rsFilePhoto.map(item => formData.append('rsFilePhoto', item)) : formData.append('rsFilePhoto', new File([], 'document.pdf'))


    //서버로 보내기
    axios.post('/api/resume/reg',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data;',
          accessToken: getCookie('accessToken').toString(),
          lastLoginTime: getCookie('lastLoginTime').toString()
        },
      }).then((res) => {
        if (res.data.resultCode === '803') {
          window.alert(res.data.resultMessage)
        } else if (res.data.resultCode === '200') {
          window.alert(res.data.resultMessage)
          window.location.href = '/';
        } else {
          window.alert(res.data.resultMessage)
        }

      })
      .catch((res) => console.log(res))

  }


  // 데이터 리스트 불러오기
  useEffect(() => {
    axios.get('/api/resume/reg', {
      withCredentials: true,
      headers: {
        accessToken: getCookie('accessToken'),
        lastLoginTime: getCookie('lastLoginTime'),
      }
    }).then((res) => {
      // console.log(res.data.result)
      setData(res.data.result)
      setSkillList({
        ...skillList,
        category: Array.from(new Set(res.data.result.skillList.map(item => item.skillCategory))),
        origin: res.data.result.skillList
      })
      setMultipleSkills({
        ...multipleSkills,
        category: Array.from(new Set(res.data.result.skillList.map(item => item.skillCategory))),
        origin: res.data.result.skillList
      })
      // console.log(Array.from(new Set(res.data.result.skillList.map(item => item.skillCategory))))
      setMobileStatus({
        ...mobile,
        api: res.data.result,
        businessDepthMenu: DepthSplit(mobile, 'businessDepthMenu', 'businessTypeList', 'businessType'),
        jobDepthMenu: DepthSplit(mobile, 'jobDepthMenu', 'jobTypeList', 'jobType'),
        hopeCareerDepthMenu: DepthSplit(mobile, 'hopeCareerDepthMenu', 'hopeCareerList', 'hopeCareer'),
      })
    })
  }, [])

  const [modalFlag, setModalFlag] = useState({
    main: false,
    goal: false,
    occupation: false,
    business: false,
  })

  const [skillPlusModal, setskillPlusModal] = useState();


  const [multipleSkills, setMultipleSkills] = useState({
    category: [],
    skillName: [],
    origin: [],
    selector: {
      arr: []
    },
  })

  const handleUpdateMultipleSkill = (e, item) => {
    const value = item ? item : e.target.value
    const key = e.target.id.replace(' dropdown-button-dark-example1', '')

    setMultipleSkills({
      ...multipleSkills,
      selector: {
        ...multipleSkills.selector,
        [key]: value
      }
    })
  }

  const handleAddMultipleSkill = (e) => {
    const selector = multipleSkills.selector
    let flag = false
    if (selector.skillCode && selector.careerCode) {
      selector.arr.map(item => {
        if (item.name === selector.skillCode.skill) {
          flag = true
        }
      })
      if (flag) {
        alert('스킬이 중복선택 되었습니다.')

        return 0
      }
      const tempSelector = selector.arr

      tempSelector.push({
        name: selector.skillCode.skill,
        year: selector.careerCode
      })

      document.querySelectorAll('#skillCode').forEach(item => {
        item.checked = false
      })

      setMultipleSkills({
        ...multipleSkills,
        selector: {
          arr: [...tempSelector]
        }
      })
    }
  }


  const handleChangeSKillList = () => {
    const skillArr = skillItem.arr
    const multipleSelectArr = multipleSkills.selector.arr
    const tempBodyCareer = [...body?.careerCode]
    const tempBodySkill = [...body?.skillCode]

    multipleSelectArr.map((multi, mKey) => {
      const multiName = multipleSkills.origin.filter(skill => skill.skill === multi.name)[0]?.skillName
      const multiYear = data.skillCareerList.filter(career => career.skillCareer === multi.year)[0]?.skillCareerName
      let passKey = -1
      skillArr.map((skill, key) => {
        if (skill.name === multiName) {
          passKey = mKey
          skillArr[key] = {
            name: multiName,
            year: multiYear
          }
          tempBodySkill[key] = multi.name
          tempBodyCareer[key] = multi.year
        }
      })

      if (passKey !== mKey) {
        skillArr.push({
          name: multiName,
          year: multiYear
        })
      }

      console.log(tempBodySkill.indexOf(multi.name))
      if (tempBodySkill.indexOf(multi.name) === -1) {
        tempBodySkill.push(multi.name)
      }
      if (tempBodyCareer.indexOf(multi.year) === -1) {
        tempBodyCareer.push(multi.year)
      }

      setSkillList({
        ...skillList,
        arr: [...skillArr]
      })
      setBody({
        ...body,
        careerCode: [...tempBodyCareer],
        skillCode: [...tempBodySkill]
      })
    })

    console.log(body)

  }

  return <>
    <div className='resume-mng '>
      <div className='box-type-default hidden lg:block'>
        <div className='p-5 border-b border-slate-200/60 text-sm'>
          履歴書登録
        </div>
        <div className='resume-regist-cont'>
          <div className='flex gap-3'>
            {
              image.length === 0 ? previewItem : image.map((_, index) => (
                <div className='image_item bg-slate-50' key={index}>
                  <input
                    id={`profileImg${index}`}
                    type={'file'}
                    multiple
                    onChange={(e) => handleChangeImage(e, index)}
                  />
                  <label className={'custom-input-label'} htmlFor={`profileImg${index}`}>
                    <img src={image[index]} alt='' />
                  </label>
                  {image[index] && (
                    <button onClick={() => handleDeleteImage(index)}>
                      <img src={Xbutton} alt='삭제' />
                    </button>
                  )}
                </div>
              ))
            }
          </div>

          <div className='camera-subtit'>
            最大5枚　JPG、PNG、GIF形式で登録可能です。
          </div>

          <div className='form-flex-box flex space-between items-start'>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>国籍 <span>*</span></div>
              <SelectBox id={'country'} data={data && data.countryList} onChange={handleSelectChangeEvent} defaultValue={body.country} />

            </div>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>学歴 <span>*</span></div>
              <SelectBox id={'education'} data={data && data.educationList} onChange={handleSelectChangeEvent} defaultValue={body.education} />
            </div>
          </div>
          <div className='form-flex-box flex space-between items-start'>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>性別 <span>*</span></div>
              <SelectBox id={'userGender'} data={data && data.userGenderList} onChange={handleSelectChangeEvent} defaultValue={body.userGender} />
            </div>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>最終学校名 <span>*</span></div>
              <input id='schoolName regular-form-1' type='text' className='form-control' placeholder='最終学校名入力'
                onChange={handleInputTextChangeEvent} />
            </div>
          </div>
          <div className='form-flex-box flex space-between items-start'>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>生年 <span>*</span></div>
              <div className='flex items-center gap-2'>
                <SelectBox id={'userAge'} data={data && data.userAgeList} onChange={handleSelectChangeEvent} defaultValue={body.userAge} />
                <div
                  className='btn btn-sm btn-ouline-secondary w-40 btn-age'>{body && body.userAge ? handleAgeCalculator() : '0歳'}</div>
              </div>
            </div>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>専攻 <span>*</span></div>
              <input id='majorName regular-form-1' type='text' className='form-control' placeholder='専攻入力'
                onChange={handleInputTextChangeEvent} />
            </div>
          </div>
          <div className='form-flex-box flex space-between items-start'>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>居住地 <span>*</span></div>
              <SelectBox id={'residentialArea'} data={data && data.residentialAreaList}
                onChange={handleSelectChangeEvent}
                defaultValue={body.residentialArea}
              />

            </div>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>希望年収 <span>*</span></div>
              <SelectBox id={'hopeIncome'} data={data && data.hopeIncomeList} onChange={handleSelectChangeEvent} defaultValue={body.hopeIncome} />
            </div>
          </div>
          <div className='form-flex-box flex space-between items-start'>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>イーメール <span>*</span></div>
              <div className='flex items-center gap-2'>
                <input id='userEmail regular-form-1' type='text' className='form-control' placeholder='イーメール入力'
                  onChange={handleInputTextChangeEvent}
                  onBlur={handleCheckText}
                />
                <div className='form-check form-switch flex gap-2'>
                  <div className='switch-tit shrink-0 w40'>{body.userEmailFlag === '0' ? '非公開' : '公開'}</div>
                  <input
                    id='userEmailFlag product-status-active'
                    className='form-check-input toggle-input'
                    type='checkbox'
                    onChange={handleSelectChangeEvent}
                    checked={body.userEmailFlag === '1'}
                  />
                </div>
              </div>
            </div>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>電話番号 <span>*</span></div>
              <div className='flex items-center gap-2'>
                <input id='phoneNumber regular-form-1' type='text' className='form-control'
                  placeholder='-なしで数字だけ入力してください。' onChange={handleInputTextChangeEvent}
                  onBlur={handleCheckText}
                />
                <div className='form-check form-switch flex gap-2'>
                  <div className='switch-tit shrink-0 w40'>{body.phoneNumberFlag === '0' ? '非公開' : '公開'}</div>
                  <input
                    id='phoneNumberFlag product-status-active'
                    className='form-check-input toggle-input'
                    type='checkbox'
                    onChange={handleSelectChangeEvent}
                    checked={body.phoneNumberFlag === '1'}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='divider' />

          <div className="form-flex-box flex space-between items-start">
            <div className="box-item2 flex flex-col">
              <div className="form-tit">将来の目標<span>*</span></div>
              <button className='btn btn-primary flex-start'
                onClick={() => {
                  setModalFlag({ ...modalFlag, main: true, goal: true })
                }}
              >{depthMenu.hopeCareer.depth_first} &gt; {depthMenu.hopeCareer.depth_seconds}</button>
            </div>
          </div>

          <div className='form-flex-box flex space-between items-start'>
            <div className='box-item flex flex-col'>
              <div className='form-tit'>経歴 <span>*</span></div>
              <SelectBox id={'career'} data={data && data.careerList} onChange={handleSelectChangeEvent} defaultValue={body.career} />
            </div>
            <div className="box-item flex flex-col">
              <div className="form-tit">現在の職種 <span>*</span></div>
              <button className='btn btn-primary'
                onClick={() => {
                  setModalFlag({ ...modalFlag, main: true, occupation: true })
                }}
              >
                {depthMenu.jobType.depth_first} &gt; {depthMenu.jobType.depth_seconds}
              </button>
            </div>
            <div className="box-item flex flex-col">
              <div className="form-tit">所属会社の業種 <span>*</span></div>
              <button className='btn btn-primary'
                onClick={() => {
                  setModalFlag({ ...modalFlag, main: true, business: true })
                }}
              >
                {depthMenu.businessType.depth_first} &gt; {depthMenu.businessType.depth_seconds}
              </button>
            </div>
          </div>

          <div className='divider' />


          {/* 主要経歴 */
            career.map((career, key) => {
              return <CareerWrite
                key={key}
                index={key}
                addState={key === 0}
                data={data}
                body={body}
                handleAddBtn={handleAddBtn}
                projectRoleList={data?.projectRoleList}
                projectProcessDefault={data?.projectProcessDefault}
                projectProcessList={data?.projectProcessList}
                handleCareerChange={handleCareerChange}
                handleProjectProcessChange={handleProjectProcessAdd}
                handleProjectProcessDel={handleProjectProcessDel}
                handleCareerChangeAndProcess={handleCareerChangeAndProcess}
              />
            })
          }

          <div className='divider' />

          {/* 나의 스킬 */}
          <div className='flex-box2-tit flex space-between mt-16'>
            <div className='box2-tit'>私のスキル <span> *</span></div>
          </div>
          <div className="flex-box2-cont form-flex-box">
            <div className="form-flex-box flex space-between items-start">
              <div className="box-item flex flex-col">
                <div className="form-tit">スキル検索</div>
                <div className='relative text-slate-500'>
                  <input
                    type='text'
                    className='form-control pr-10'
                    placeholder='検索'
                    onChange={(e) => {
                      if (e.target.value !== '') {
                        setSkillList({
                          ...skillList,
                          skillName: [...skillList.origin.filter(item => item.skillName.toUpperCase().includes(e.target.value.toUpperCase()))]
                        })
                      } else {
                        setSkillList({
                          ...skillList,
                          skillName: []
                        })
                      }
                    }}
                  />
                  <button className='w-4 h-4 absolute my-auto inset-y-0 mr-3 right-0'>
                    <img src={Search} alt='' />
                  </button>
                </div>
              </div>
              <div className='box-item flex flex-col'>
                <div className='form-tit'>経歴期間</div>
                <div className='flex items-center gap-2'>
                  <SelectBox className={'refTarget_select'} id={'careerCode'} data={data && data.skillCareerList}
                    onChange={handleUpdateSkill} defaultValue={skillItem.temp?.careerCode?.careerCode} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-between mb-4">
              <button onClick={() => {
                setskillPlusModal(true);
              }}>
                <img src={attachIcon} alt='' className='ml-2' />
              </button>
              <div className='btn btn-sm btn-register w-40 btn-age' onClick={handleAddSkills}>登録</div>
            </div>
            <div className='skil_list'>
              <div className="list-group list-over">
                {
                  skillList && skillList.skillName.map((skill, key) => {
                    return <div key={key} className='list-group-item'>
                      <label className='checkbox-btn w-18 flex item-center'>
                        <input id={'skillCode'} name='group' className='form-check-input chg2 refTarget_radio'
                          type='radio' onChange={(e) => handleUpdateSkill(e, skill)} />
                        <span>{skill.skillCategoryName} | {skill.skillName}</span>
                      </label>
                    </div>
                  })
                }
              </div>
            </div>
          </div>
          <div className='blue-tit'>
            登録されたスキルリスト
          </div>
          <div className='blue-btn-wrap flex gap-2 items-center'>
            {
              skillItem.arr.map((item, key) => {
                return (
                  <div className='blue-btn new-skillist' key={key}>
                    <span className="skilllist-langu blue-line pr-2 inline-block">
                      {skillList.origin.filter(skill => skill.skillName === item.name)[0]?.skillCategoryName}
                    </span>
                    <span className="pr-2 inline-block">{item.name}</span>
                    <span>{item.year}</span>
                    <button className='blue-x-btn'
                      onClick={(e) => {
                        const tempArr = [...skillItem.arr.filter(it => it.name !== item.name)]
                        setSkillItem({
                          ...skillItem.temp,
                          arr: [...tempArr]
                        })
                      }}>
                      <img src={blueX} alt='' />
                    </button>
                  </div>
                )
              })
            }
          </div>

          <div className='divider' />

          {/* 簡単な自己紹介 */}
          <div className='flex-box2-tit flex space-between mt-16'>
            <div className='box2-tit'>自己紹介</div>
            <div className='text-slate-400'>{body.additionalComment === "" ? "0" : body.additionalComment.length} / 200字</div>
          </div>
          <div className='flex-box2-cont textarea_style'>
            <textarea name='' id='additionalComment' cols='' rows='10' className='w-full'
              maxLength={200} placeholder='自由に自己紹介をしてください。' onChange={handleInputTextChangeEvent} />
          </div>

          <div className='attach-wrap flex'>
            <div className='attach-tit-wrap flex items-center'>
              <div className='filebox attach-tit flex items-center'>
                <label htmlFor='file' className='flex items-center cursor-pointer'>
                  ファイル添付
                  <input type='file' id='file' onChange={handleFileUpload} multiple />
                  <img src={attachIcon} alt='' className='ml-2' />
                </label>
              </div>
            </div>
            <div className='flex flex-col attach-cont-wrap'>
              {fileNames.map((name, index) => (
                <div className='attach-cont-item flex items-center space-between' key={index}>
                  <input className='upload-name mr-2 attach-cont-tit' value={name} placeholder='' readOnly />
                  <button className='attach-cont-btn' onClick={() => handleDeleteFile(index)}>
                    <img src={blacksmallX} alt='' />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className='download-btn flex'>
            <button className='btn btn-outline-primary flex items-center h48' onClick={() => window.open('https://hitobito-net.com/api/files/sample.pdf')}>
              サンプル·ダウンロード
              <img src={Download} alt='' />
            </button>
            <button className='btn btn-primary flex items-center h48' onClick={handleSubmit}>
              登録
            </button>
          </div>
          <div className='blue-tit'>
            作成が難しいですか？ サンプルをダウンロードしてみてください。
          </div>
        </div>
      </div>

      {
        mobile.businessDepthMenu && mobile.jobDepthMenu && mobile.hopeCareerDepthMenu ? <Modal
          show={modalFlag.main}
          onHidden={() => {
            setModalFlag({
              main: false,
              goal: false,
              occupation: false,
              business: false,
            })
          }}
        >
          <ModalHeader>
            <h2 className="font-medium text-base mr-auto">
              {modalFlag.goal ? '将来の目標' : modalFlag.occupation ? '現在の職種' : modalFlag.business ? '所属会社の業種' : ''}
            </h2>
          </ModalHeader>
          <ModalBody className="p-10 text-center">
            <div className='flex items-center gap-3'>
              <SelectBox
                className={modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : ''}
                id={modalFlag.goal ? 'hopeCareerOneDeps' : modalFlag.occupation ? 'jobTypeOneDeps' : modalFlag.business ? 'businessTypeOneDeps' : ''}
                data={mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : '']}
                // value={mobile[modalFlag.goal ? 'hopeCareerOneDepth' : modalFlag.occupation ? 'jobTypeOneDepth' : modalFlag.business ? 'businessTypeOneDepth' : '']}
                defaultValue={
                  mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : '']
                    ?.filter(item => item[modalFlag.goal ? 'hopeCareerName' : modalFlag.occupation ? 'jobTypeName' : modalFlag.business ? 'businessTypeName' : ''] === depthMenu[modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '']?.depth_first).length > 0 ?
                    mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : '']
                      ?.filter(item => item[modalFlag.goal ? 'hopeCareerName' : modalFlag.occupation ? 'jobTypeName' : modalFlag.business ? 'businessTypeName' : ''] === depthMenu[modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '']?.depth_first)[0][modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '']
                    : ''
                }
                onChange={(e) => {
                  ModalEvent(modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '')
                    .oneDepth(e, depthMenu, setDepthMenu, mobile, modalFlag)
                }}
              />
              <SelectBox
                id={modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : ''}
                data={
                  mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : 'ap'] && mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : ''].length > 0
                    ? mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : ''][modalFlag.goal ? depthMenu.hopeCareer.depth : modalFlag.occupation ? depthMenu.jobType.depth : modalFlag.business ? depthMenu.businessType.depth : 0]?.child
                    : []
                }
                defaultValue={
                  (mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : 'ap'] && mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : ''].length > 0
                    ? mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : ''][modalFlag.goal ? depthMenu.hopeCareer.depth : modalFlag.occupation ? depthMenu.jobType.depth : modalFlag.business ? depthMenu.businessType.depth : 0]?.child
                    : [])
                    ?.filter(item => item[modalFlag.goal ? 'hopeCareerName' : modalFlag.occupation ? 'jobTypeName' : modalFlag.business ? 'businessTypeName' : ''] === depthMenu[modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '']?.depth_seconds).length > 0 ?
                    (mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : 'ap'] && mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : ''].length > 0
                      ? mobile[modalFlag.goal ? 'hopeCareerDepthMenu' : modalFlag.occupation ? 'jobDepthMenu' : modalFlag.business ? 'businessDepthMenu' : ''][modalFlag.goal ? depthMenu.hopeCareer.depth : modalFlag.occupation ? depthMenu.jobType.depth : modalFlag.business ? depthMenu.businessType.depth : 0]?.child
                      : [])
                      ?.filter(item => item[modalFlag.goal ? 'hopeCareerName' : modalFlag.occupation ? 'jobTypeName' : modalFlag.business ? 'businessTypeName' : ''] === depthMenu[modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '']?.depth_seconds)[0][modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '']
                    : null
                }
                onChange={(e) => {
                  ModalEvent(modalFlag.goal ? 'hopeCareer' : modalFlag.occupation ? 'jobType' : modalFlag.business ? 'businessType' : '')
                    .secondDepth(e, depthMenu, setDepthMenu, body, setBody)
                }}
              />
            </div>

          </ModalBody>
          <ModalFooter>
            <div className="sel-btn-wrap flex justify-center gap-2">
              <button className="btn btn-outline-secondary"
                onClick={() => {
                  setModalFlag({
                    main: false,
                    goal: false,
                    occupation: false,
                    business: false,
                  })
                }}
              >
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={() => {
                setModalFlag({
                  main: false,
                  goal: false,
                  occupation: false,
                  business: false,
                })
              }}>
                登録
              </button>
            </div>
          </ModalFooter>
        </Modal> : null
      }
      <div className="mo-resume-mng">
        <ResumeMobile data={data} progress="progress-bar  w-1/5 bg-green" />
      </div>
    </div>
    <MobileBottom />

    {/* 簡単な自己紹介 200자이상 실패 */}
    <Modal
      show={infoLimitFail}
      onHidden={() => {
        setInfoLimitFail(false);
      }}
    >
      <ModalBody className="p-10 text-center">
        <div className="modal-tit mb-5">
          글자는 200까지 입력 가능합니다.
        </div>
        {/* <div className="modal-subtit">管理者に問い合わせしてください。</div> */}
        <div className="flex flex-end gap-3">
          <a
            className="btn btn-primary"
            onClick={() => {
              setInfoLimitFail(false);
            }}
          >
            確認
          </a>
        </div>
      </ModalBody>
    </Modal>


    {/* 스킬검색 모달*/}
    <Modal className="skill-search-modal"
      show={skillPlusModal}
      onHidden={() => {
        setskillPlusModal(false);
      }}
    >
      <ModalHeader>
        <div className="flex space-between items-center w-full">
          <h2 className="modal-tit">
            スキル検索
          </h2>
          <button className="" onClick={() => {
            setskillPlusModal(false);
          }}>
            <Lucide icon="X" className="w-4 h-4" />
          </button>
        </div>
      </ModalHeader>
      <ModalBody className="p-10 text-center">
        <div className="flex gap-4 modal-blue-bg items-start">
          <div className="mb-5 flex flex-col gap-2 items-start">
            <div className='form-tit'>カテゴリ</div>
            <select
              className="form-select w-full"
              id={'skillCategory'}
              ref={categoryRef}
              onChange={(e) => {
                setMultipleSkills({
                  ...multipleSkills,
                  skillName: [
                    ...skillList.origin
                      .filter(item => item.skillName.toUpperCase().includes(skillNameRef.current.value.toUpperCase()))
                      .filter(item => item.skillCategory === e.target.value)
                  ]
                })
              }}
            >
              {
                multipleSkills.category.map(item => {
                  return <option value={item}>{multipleSkills.origin.filter(skill => skill.skillCategory === item)[0].skillCategoryName}</option>
                })
              }
            </select>
          </div>
          <div className="">
            <div className="flex gap-2">
              <div className="flex flex-col gap-2 items-start w-full">
                <div className='form-tit'>スキル検索</div>
                <div className='relative text-slate-500 w-full'>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='検索'
                    ref={skillNameRef}
                    onChange={(e) => {
                      if (e.target.value !== '') {
                        setMultipleSkills({
                          ...multipleSkills,
                          skillName: [
                            ...multipleSkills.origin
                              .filter(item => item.skillName.toUpperCase().includes(e.target.value.toUpperCase()))
                              .filter(item => item.skillCategory === categoryRef.current.value)
                          ]
                        })
                      } else {
                        setMultipleSkills({
                          ...multipleSkills,
                          skillName: []
                        })
                      }
                    }}
                  />
                  <button className='w-4 h-4 absolute my-auto inset-y-0 mr-3 right-0'>
                    <img src={Search} alt='' />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <div className='form-tit'>経歴期間</div>
                <SelectBox className={'refTarget_select w-40'} id={'careerCode'} data={data && data.skillCareerList}
                  onChange={handleUpdateMultipleSkill} defaultValue={multipleSkills.selector?.careerCode} />
              </div>
            </div>
            <div className='skil_list mt-4'>
              <div className="list-group list-over">
                {
                  multipleSkills && multipleSkills.skillName.map((skill, key) => {
                    return <div key={key} className='list-group-item'>
                      <label className='checkbox-btn w-18 flex item-center'>
                        <input id={'skillCode'} name='group' className='form-check-input chg2 refTarget_radio'
                          type='radio' onChange={(e) => handleUpdateMultipleSkill(e, skill)} />
                        <span>{skill.skillCategoryName} | {skill.skillName}</span>
                      </label>
                    </div>
                  })
                }
              </div>
            </div>
          </div>
          <div class="blue-btn-wrap flex gap-2 items-center">
            {
              multipleSkills.selector.arr.map((item, key) => {
                return (
                  <div key={key} className='blue-btn'>
                    <span className="skilllist-langu blue-line pr-2 inline-block">
                      {multipleSkills.origin.filter(skill => skill.skill === item.name)[0]?.skillCategoryName}
                    </span>
                    <span className="pr-2 inline-block">{
                      multipleSkills.origin.filter(skill => skill.skill === item.name)[0]?.skillName
                    }</span>
                    <span>{data.skillCareerList.filter(career => career.skillCareer === item.year)[0]?.skillCareerName}</span>
                    <button className='blue-x-btn'
                      onClick={(e) => {
                        const tempArr = [...multipleSkills.selector.arr.filter(it => it.name !== item.name)]
                        setMultipleSkills({
                          ...multipleSkills,
                          selector: {
                            ...multipleSkills.selector,
                            arr: [...tempArr]
                          }
                        })
                      }}>
                      <img src={blueX} alt='' />
                    </button>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className="w-full text-left mt-4 text-slate-500">* カテゴリー選択後、スキルを検索し経歴を入力してください。</div>
        {/* <div className="modal-subtit">管理者に問い合わせしてください。</div> */}
        <div className="flex flex-end gap-3 mt-16">
          <a
            className="btn btn-outline-primary w-auto"
            onClick={(e) => {
              handleAddMultipleSkill(e)
            }}
          >
            <img className='mr-2' src="/src/assets/images/add-btn.svg" alt=""/>
            スキル追加
          </a>
          <a
            className="btn btn-primary"
            onClick={(e) => {
              // setskillPlusModal(false);
              handleChangeSKillList()
              skillNameRef.current.value = ''
              setMultipleSkills({
                ...multipleSkills,
                skillName: [],
                selector: {
                  arr: []
                },
              })
              setskillPlusModal(false);
            }}
          >
            登録
          </a>
        </div>
      </ModalBody>
    </Modal>
  </>
};
export default ResumeRegist;
