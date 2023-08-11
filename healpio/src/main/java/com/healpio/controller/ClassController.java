package com.healpio.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.healpio.service.ClassService;
import com.healpio.vo.ClassVO;
import com.healpio.vo.Criteria_review;
import com.healpio.vo.LocationVO;
import com.healpio.vo.MemberVO;

import lombok.extern.log4j.Log4j;

@Controller
@RequestMapping("/class/*")
@Log4j
public class ClassController {
	
	@Autowired
	ClassService classService;
	
	@GetMapping("write")
	public void write(Model model) {
		classService.getExerciseList(model);
	}
	
	@PostMapping("write")
	public String insert(ClassVO classVO, LocationVO locationVO, List<MultipartFile> files, Model model) {
		try {
			if(classService.insert(classVO, locationVO, files)>0) {
				model.addAttribute("class_no", classVO.getClass_no());
				model.addAttribute("message", "등록되었습니다.");
				return "/class/message";
			} else {
				// 사실 여기까지 오지 않는다. 예외 발생시 try-catch문에서 처리한다.
				model.addAttribute("message", "게시글 등록 중 오류가 발생하였습니다.");
				return "/class/message";
			}
		} catch (Exception e) {
			e.printStackTrace();
			// Exception Message에 첨부파일이라는 단어가 들어 있으면 해당 Exception Message를 저장
			if(e.getMessage().indexOf("첨부파일")>-1) {
				model.addAttribute("message", e.getMessage());
			} else {
				// 들어 있지 않으면 글 등록과 관련된 예외이다.
				model.addAttribute("message", "게시글 등록 중 오류가 발생하였습니다.");
			}
			return "/class/message";
		}
	}
	
	@GetMapping("read")
	public String read(String class_no, HttpSession session, Model model) {
		MemberVO memberVo = (MemberVO)session.getAttribute("memberVo");
		if(memberVo!=null) {
			classService.getOne(class_no, memberVo.getMember_no(), model);
		} else {
			classService.getOne(class_no, "", model);
		}
		// '존재하지 않는 글입니다.' 메시지가 모델에 저장되어 있으면
		if(model.containsAttribute("message")){
			return "/class/message";
		}
		return "/class/read";
	}
	
	@GetMapping("edit")
	public void edit(String class_no, String member_no, Model model) {
		classService.getOne(class_no, member_no, model);
		classService.getLocation(class_no, model);
		classService.getExerciseList(model);
	}
	
	@PostMapping("edit")
	public String edit(ClassVO classVO, LocationVO locationVO, List<MultipartFile> files, Model model) {		
		try {
			if(classService.update(classVO, locationVO, files)>0) {
				model.addAttribute("class_no", classVO.getClass_no());	
				model.addAttribute("message", "수정되었습니다.");
				return "/class/message";
			} else {
				model.addAttribute("message", "수정 중 오류가 발생하였습니다.");
				return "/class/message";
			}
		} catch (Exception e) {
			log.info(e.getMessage());
			e.printStackTrace();
			if(e.getMessage().indexOf("첨부파일")>-1) {
				model.addAttribute("message", e.getMessage());
			} else {
				model.addAttribute("message", "첨부파일 수정 중 오류가 발생하였습니다.");
			}
			return "/class/message";
		}
	}
	
	@GetMapping("delete")
	public String delete(String class_no, Criteria_review criteria, Model model) {
		if(classService.delete(class_no, criteria, model)>0) {
			model.addAttribute("message", "게시글이 삭제되었습니다.");			
		} else {
			model.addAttribute("message", "예약 내역이 존재하여 게시글을 삭제할 수 없습니다.");
		}			
		return "/class/message";
	}
	
	@GetMapping("scrap")
	@ResponseBody
	public Map<String, Object> scrap(String class_no, String member_no) {
		Map<String, Object> map = new HashMap<String, Object>();
		if(classService.scrap(class_no, member_no)>0) {
			map.put("result", "success");
		} else {
			map.put("result", "fail");
		}
		return map;		
	}
	
	@GetMapping("cancelScrap")
	@ResponseBody
	public Map<String, Object> cancelScrap(String class_no, String member_no) {
		Map<String, Object> map = new HashMap<String, Object>();
		if(classService.cancelScrap(class_no, member_no)>0) {
			map.put("result", "success");
		} else {
			map.put("result", "fail");
		}
		return map;
	}
	
}
