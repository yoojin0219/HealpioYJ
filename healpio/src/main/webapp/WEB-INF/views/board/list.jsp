	<%@ page language="java" contentType="text/html; charset=UTF-8"
	    pageEncoding="UTF-8"%>
	    <%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
	<!DOCTYPE html>
	<html lang="ko">
	<head>
	<meta charset="UTF-8">
	<title>Insert title here</title>
	
		<link href="../resources/css/list.css" rel="stylesheet"> 
	<script>
	function classWirte() {
	  window.location.href = '/class/write?member_no=${memberVo.member_no }';
	}
	</script>
	
		<script src="../resources/js/list.js"></script>
	</head>
	<body>
	

	
  	    <%@ include file="../common/header.jsp" %> 
	
	    <div  class='pull' >
		<input type="text" name="member_no" value="${memberVo.member_no }">
		

	        <div class='header'>

	            <h3>스포츠 플랫폼</h3>
	            <input type="text" value="${pageDto.total}">
				<!-- <select> 요소에 onchange 이벤트를 통해 filterByExercise 함수 호출 -->
				<select name='sports' onchange="filterByExercise()">
				  <option value='x'>운동종류</option>
				  <c:forEach items="${exerciseList}" var="ex">
				  <option value="${ex.exercise_name}" ${pageDto.cri.exercise_name ==  ex.exercise_name ? 'selected' : '' }>${ex.exercise_name}</option>
				  </c:forEach>
				</select>

	            
	           
				<jsp:include page="/WEB-INF/views/common/searchForm.jsp" />
	 			
	            <select name='array' >
	                <option value='x'>인기순</option>
	                <option value='ko'>최신순</option>
	            </select>
	        </div>
	
	        <div class='main'>
	
			  <c:forEach items="${list}" var="li" varStatus="status">
				<div class="contentbox">
				<a href="/class/read?class_no=${li.class_no}">
				 ${li.uuid } <br>
				</a >	  
				      ${li.class_title}<br>
					  ------------------------------------------<br>
					 ${li.nickname } | ${li.teacheryn } ${li.class_no }
					 <a class="exercise-text">${li.exercise_name }</a> |
					 <a class="province-text">${li.province }</a> <a class="city-text">${li.city }</a> <a class="district-text">${li.district }</a>
				</div>
			  </c:forEach>
	
	 		</div>
	 	
			<div class="footer">
	            <button class="regBtn"   onclick="classWirte()">등록하기</button>
		        <!-- 페이지 번호 출력 -->
		        <jsp:include page="/WEB-INF/views/common/pageNavi.jsp" />
		        <%-- <%@ include file="../common/pageNavi.jsp" %> --%>
			</div>
			
	     </div>
	
	        시티 : ${param.sel_city}<br>
	    시도 : ${param.sel_province }
	     <%@ include file="../common/footer.jsp" %>
	</body>
	</html>