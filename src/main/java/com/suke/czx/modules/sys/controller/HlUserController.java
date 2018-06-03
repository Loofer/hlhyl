package com.suke.czx.modules.sys.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.suke.czx.common.utils.PageUtils;
import com.suke.czx.common.utils.Query;
import com.suke.czx.common.utils.R;
import com.suke.czx.modules.hladmin.entity.HlRewardEntity;
import com.suke.czx.modules.hladmin.service.HlHylPriceService;
import com.suke.czx.modules.hladmin.service.HlRewardService;
import com.suke.czx.modules.sys.entity.HlUserEntity;
import com.suke.czx.modules.sys.service.HlUserService;

/**
 * 
 * 
 * @author czx
 * @email ${email}
 * @date 2018-06-03 14:05:20
 */
@RestController
@RequestMapping("/sys/hluser")
public class HlUserController extends AbstractController {
	@Autowired
	private HlUserService hlUserService;
	@Autowired
	private HlHylPriceService hlHylPriceService;
	@Autowired
	private HlRewardService hlRewardService;

	/**
	 * 列表
	 */
	@RequestMapping("/list")
	public R list(@RequestParam Map<String, Object> params) {
		// 查询列表数据
		String price = hlHylPriceService.queryMaxPrice();
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put("price", price);

		Map<String, Object> userQueryMap = new HashMap<String, Object>();
		userQueryMap.put("userName", this.getUser().getUsername());
		HlUserEntity user = hlUserService.queryList(userQueryMap).get(0);
		map.put("amount", user.getAmount());
		map.put("lockAmount", user.getLockAmount());
		map.put("recUser", user.getRecUser());

		Map<String, Object> mapReward = new HashMap<String, Object>();
		mapReward.put("userName", user.getUserName());
		double recreward = hlRewardService.queryList(mapReward).stream().map(HlRewardEntity::getAmount)
				.mapToDouble(Double::doubleValue).sum();
		map.put("recReward", recreward);

		return R.ok().put("hlUser", map);
	}

	/**
	 * 信息
	 */
	@RequestMapping("/info/{id}")
	public R info(@PathVariable("id") Integer id) {
		HlUserEntity hlUser = hlUserService.queryObject(id);

		return R.ok().put("hlUser", hlUser);
	}

	/**
	 * 保存
	 */
	@RequestMapping("/save")
	public R save(@RequestBody HlUserEntity hlUser) {
		hlUserService.save(hlUser);

		return R.ok();
	}

	/**
	 * 保存
	 */
	@RequestMapping("/lock/{willLockAmount}")
	public R lock(@PathVariable("willLockAmount") Double willLockAmount) {
		Map<String, Object> userQueryMap = new HashMap<String, Object>();
		userQueryMap.put("userName", this.getUser().getUsername());
		HlUserEntity hue = hlUserService.queryList(userQueryMap).get(0);
		if (hue.getAmount() < willLockAmount) {
			return R.error("锁仓金额不可大于流通金额");
		}

		hue.setAmount(hue.getAmount() - willLockAmount);
		hue.setLockAmount(hue.getLockAmount() + willLockAmount);
		hlUserService.update(hue);
		return R.ok();
	}

	/**
	 * 修改
	 */
	@RequestMapping("/update")
	public R update(@RequestBody HlUserEntity hlUser) {
		hlUserService.update(hlUser);

		return R.ok();
	}

	/**
	 * 删除
	 */
	@RequestMapping("/delete")
	public R delete(@RequestBody Integer[] ids) {
		hlUserService.deleteBatch(ids);

		return R.ok();
	}

}